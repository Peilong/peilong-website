+++
abstract = "The high-level P4 programming language promises protocol and hardware-agnostic design of network functions. As the low-level functional implementation, the P4 Behavior Model (BMv2) provides the necessary constructional blocks (parser, deparser, lookup tables, and action primitives, etc.) into which any P4 dataplane programs can be compiled. However, the existing BMv2 endures performance ineffectiveness on x86 machines from three aspects: 1) the employment of non-optimized libpcap and Linux NIC driver as packet I/O; 2) the lack of support for scalable multicore processing; and 3) the inefficient pipeline design and unnecessary memory copies. In this work, we manage to address the aforementioned drawbacks with a series of performance optimization steps: 1) leveraging DPDK drivers and libraries to accelerate the I/O performance; 2) employing RSS and multiple queues to enable multicore processing; and 3) eliminating unnecessary memory duplication and Mutex and optimizing the LPM engine. Experiment results show that for 64-byte packets the optimized BMv2 can reach 10 Gbps receiving rate and the packet drop rate for basic packet forwarding is within 20%. In the P4 LPM router example, the DPDK-accelerated BMv2 achieves 24x performance increase over the vanilla BMv2."

title = "BMAcc: Accelerating P4-based Data Plane with DPDK"
authors = ["Peilong Li", "Xiaoban Wu", "Yan Luo", "Liang-min Wang", "Marc Pepin", "Atul Kwatra", "John Morgan"]
date = "2017-11-14"

image_preview = ""
math = true

publication_types = ["0"]

publication = "In *DPDK Summit San Jose 2017*, San Jose, CA, USA"

publication_short = "In *DPDK Summit*"

selected = false

doi = ""

url_code = ""
url_dataset = ""

url_pdf = ""

url_project = ""

url_slides = ""
url_video = ""

[[links]]
name = "Talk"
url = "https://dpdk17.sched.com/event/CqvK"

# Optional featured image (relative to `static/img/` folder).
[header]
image = ""
caption = ""

+++
