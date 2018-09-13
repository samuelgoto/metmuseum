import bq_helper
from bq_helper import BigQueryHelper

# https://www.kaggle.com/paultimothymooney/how-to-query-the-metropolitan-museum-of-art
# https://www.kaggle.com/sohier/introduction-to-the-bq-helper-package
met = bq_helper.BigQueryHelper(active_project="bigquery-public-data", dataset_name="the_met")

query = "SELECT images.object_id, objects.name, objects.title, objects.department, objects.artist_display_name, objects.period, objects.is_highlight, objects.object_date, images.original_image_url, vision.reproductions, vision.partials from (SELECT object_id, ARRAY_AGG(original_image_url) as original_image_url from `bigquery-public-data.the_met.images` group by object_id) as images JOIN (SELECT object_id, ARRAY_AGG(STRUCT(webDetection.fullMatchingImages)) as reproductions, ARRAY_AGG(STRUCT(webDetection.partialMatchingImages)) as partials from `bigquery-public-data.the_met.vision_api_data` group by object_id) as vision on images.object_id = vision.object_id JOIN (SELECT object_id, object_name as name, title as title, department as department, period as period, is_highlight as is_highlight, artist_display_name as artist_display_name, object_date as object_date from `bigquery-public-data.the_met.objects`) as objects on images.object_id = objects.object_id"

result = met.query_to_pandas_safe(query)

with open("data.json", "w") as f:
    f.write(result.head(100).to_json(orient="records"))
