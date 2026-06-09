import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import io
import base64
from typing import Optional, Tuple, Union


class VisionProcessor:
    def __init__(self):
        self.max_size = 336

    def load_image(self, source: Union[str, bytes, Image.Image]) -> Image.Image:
        if isinstance(source, Image.Image):
            return source.convert("RGB")
        if isinstance(source, bytes):
            return Image.open(io.BytesIO(source)).convert("RGB")
        if source.startswith("data:"):
            header, encoded = source.split(",", 1)
            return Image.open(io.BytesIO(base64.b64decode(encoded))).convert("RGB")
        if source.startswith("http"):
            import requests
            resp = requests.get(source, stream=True)
            resp.raise_for_status()
            return Image.open(io.BytesIO(resp.content)).convert("RGB")
        return Image.open(source).convert("RGB")

    def to_cv2(self, image: Image.Image):
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    def from_cv2(self, cv_img):
        return Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))

    def enhance_for_code(self, image: Image.Image) -> Image.Image:
        cv_img = self.to_cv2(image)
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        denoised = cv2.fastNlMeansDenoising(enhanced, h=10)
        return self.from_cv2(cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR))

    def deskew(self, image: Image.Image) -> Image.Image:
        cv_img = self.to_cv2(image)
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        gray = cv2.bitwise_not(gray)
        coords = np.column_stack(np.where(gray > 0))
        if len(coords) == 0:
            return image
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = 90 + angle
        angle = -angle
        if abs(angle) < 0.5:
            return image
        h, w = cv_img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            cv_img, M, (w, h),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE
        )
        return self.from_cv2(rotated)

    def enhance_contrast(self, image: Image.Image, factor: float = 1.5) -> Image.Image:
        enhancer = ImageEnhance.Contrast(image)
        return enhancer.enhance(factor)

    def enhance_sharpness(self, image: Image.Image, factor: float = 2.0) -> Image.Image:
        enhancer = ImageEnhance.Sharpness(image)
        return enhancer.enhance(factor)

    def resize_to_max(self, image: Image.Image) -> Image.Image:
        w, h = image.size
        if w > self.max_size or h > self.max_size:
            ratio = min(self.max_size / w, self.max_size / h)
            new_size = (int(w * ratio), int(h * ratio))
            image = image.resize(new_size, Image.LANCZOS)
        return image

    def preprocess(self, image: Image.Image) -> Image.Image:
        image = self.resize_to_max(image)
        image = self.deskew(image)
        image = self.enhance_for_code(image)
        image = self.enhance_contrast(image)
        image = self.enhance_sharpness(image)
        return image

    def extract_text_regions(self, image: Image.Image) -> list:
        cv_img = self.to_cv2(image)
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 11, 2
        )
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        dilated = cv2.dilate(thresh, kernel, iterations=1)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        regions = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if w > 30 and h > 15:
                regions.append({
                    "bbox": (int(x), int(y), int(w), int(h)),
                    "area": int(w * h),
                })
        regions.sort(key=lambda r: (r["bbox"][1], r["bbox"][0]))
        return regions
