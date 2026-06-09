import boto3
s3 = boto3.client("s3",
    endpoint_url="https://6efcfaf5ca5e8d2fe4010fc86754c6d4.r2.cloudflarestorage.com",
    aws_access_key_id="f8b77f17e9724b476be4ff11542e2638",
    aws_secret_access_key="e67793e9aea918851a96ab7bc98f4e2fbb3cbb977e2761c98cafe206f82bd232")
paginator = s3.get_paginator("list_objects_v2")
pages = paginator.paginate(Bucket="neuralvision-hub", Prefix="llava-v1.6-34b-hf")
total = 0
for page in pages:
    for obj in page.get("Contents", []):
        total += 1
        sz = obj["Size"] / 1e9
        print(f"  {obj['Key']}  ({sz:.2f} GB)")
print(f"Total: {total} objects")
