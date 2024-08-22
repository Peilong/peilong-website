+++
abstract = "The P4 language was originally proposed as a means of providing programmable network data plane functions with the potential to implement, understand, and interpret custom protocols. However, the recompilation process and the re-instantiation of network functions on a target device introduces measurable downtime for network services. In this work, we present Ripple, an efficient, runtime reconfigurable P4 engine on multicore systems to eliminate the recompilation process. The Ripple framework adopts the \"generic and static\" philosophy, and uses a highly optimized universal binary executable to avoid the lengthy recompilation and reconfiguration process, while supporting packet processing at line rates. We leverage advanced I/O and vectorization techniques to take advantage of packet level parallelism and processor architectural features, thus significantly improve the performance of P4 data plane at runtime. Our in-depth evaluation on multicore architecture shows that Ripple reaches comparable throughput with one of the state-of-art frameworks that requires recompilation and reconfiguration."

title = "Ripple: An Efficient Runtime Reconfigurable P4 Data Plane for Multicore Systems"
authors = ["Xiaoban Wu", "Peilong Li", "Timothy Miskell", "Liang-Min Wang", "Yan Luo", "Xiaohong Jiang"]
date = "2019-10-10"

image_preview = ""
math = true

publication_types = ["1"]

publication = "In *IEEE 2019 International Conference on Networking and Network Applications (NaNA)*"

publication_short = "In *IEEE NaNA*"

selected = true

url_code = ""
url_dataset = ""

url_pdf = "https://ieeexplore.ieee.org/abstract/document/9027586"

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
