+++
abstract = "The programmability of the network data plane has become one of the most desirable features within the context of software defined networks, with P4 serving as a domain-specific language for defining data plane processing. In this work, we are motivated to address the challenges of mapping a P4 defined data plane to a heterogeneous programmable hardware architecture consisting of both a CPU and a GPU, which includes a salient parallel SIMD architecture for processing network flows. We first design a toolset that can be used to map a P4 program onto the proposed architecture. We then optimize the GPU kernel designs for “match-action” primitives and present latency-hiding techniques to reduce the overheads of CPU/GPU communication. In addition, load balancing is investigated to maximize the utilization of CPU and GPU resources. Our toolset and optimizations allow a P4 program to render promising performance on the given heterogeneous architecture. Specifically, the experimental results collected on our prototype systems show that the automatically configured GPU kernels achieve scalable lookup and classification speeds with 420 million IP lookups per second, and more than 60 million classifications per second (for 4K firewall rules)."

title = "P4GPU: Acceleration of programmable data plane using a CPU-GPU heterogeneous architecture"
authors = ["Peilong Li", "Yan Luo"]
date = "2016-06-14"

image_preview = ""
math = true

publication_types = ["1"]
publication = "In *2016 IEEE 17th International Conference on High Performance Switching and Routing (HPSR)*, IEEE."
publication_short = "In *IEEE HPSR*"

selected = true

url_code = ""
url_dataset = ""
url_pdf = "https://ieeexplore.ieee.org/abstract/document/7525662"
url_project = ""
url_slides = ""
url_video = ""

#[[url_custom]]
#name = ""
#url = ""

# Optional featured image (relative to `static/img/` folder).
[header]
image = ""
caption = ""

+++
