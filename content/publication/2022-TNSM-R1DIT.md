+++
abstract = "With the advances in deep learning techniques and the increase in the volume of network traffic data, deep neural networks trained directly with the raw traffic data have become more popular and successful for malware traffic classification without explicit feature extraction. However, most of the existing studies raises privacy concerns when using the payload data and ignore the generalization of the model to the newly emerged traffic such as DDoS detection on TLS 1.3. To overcome these limitations, we introduce a malware traffic classification system, Residual 1-D Image Transformer (R1DIT) model. We first leverage network domain knowledge by carefully parsing IP, HTTP, DNS, and unencrypted TLS record headers as sequences of bytes for input without interfering with IP addresses, port numbers and the payload. Then, we apply raw data transform and attention-based modules in our deep model to classify different malware types and benign traffic. Our results on NetML dataset show that the proposed model delivers 0.972 F1 score, nearly 0.3 higher than the feature-based methods and outperforms state-of-the-art models with 0.9999 F1 score for multi-class malware classification task using CICIDS2017 dataset. The generalization of this model has been proven using the TLS 1.3 traffic obtained from CICDDoS2019 dataset with the detection rate 0.9897 using meta-learning."

title = "R1DIT: Privacy-Preserving Malware Traffic Classification with Attention-Based Neural Networks"
authors = ["Onur Barut", "Yan Luo", "Peilong Li", "Tong Zhang"]
date = "2022-10-03"

image_preview = ""
math = true

publication_types = ["2"]

publication = "In *IEEE Transactions on Network and Service Management*"

publication_short = "In *IEEE TNSM*"

selected = true

doi = "10.1109/TNSM.2022.3211254"

url_code = ""
url_dataset = ""

url_pdf = "https://par.nsf.gov/servlets/purl/10391425"

url_project = ""

url_slides = ""
url_video = ""

# Optional featured image (relative to `static/img/` folder).
[header]
image = ""
caption = ""

+++
