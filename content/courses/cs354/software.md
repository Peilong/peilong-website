---
title: Software
linktitle: Software
toc: true
type: docs
date: "2019-05-05T00:00:00+01:00"
draft: false
menu:
  cs354:
    name: Software
    weight: 7

# Prev/next pager order (if `docs_section_pager` enabled in `params.toml`)
weight: 7
---

## Google Cloud Platform (GCP):
* Check out the "GCP_setup.pdf" guide on Canvas. 

## Use software on the campus server:
* Hadoop ecosystem software: [http://adal.etown.edu](http://adal.etown.edu). Use SSH to access. 
* PySpark enabled Jupyter Notebook: [http://adal.etown.edu:12345](http://adal.etown.edu:12345)

## (Optional) Install HDP Sandbox by yourself:
*	Docker Engine: https://docs.docker.com/engine/install/.
Find the correct installation guide for your operating systems.

*	Hortonworks Data Platform (HDP) on Sandbox version 2.6.5: https://www.cloudera.com/downloads/hortonworks-sandbox/hdp.html
You need to register a Cloudera account first, then choose the correct installation type on Docker (less resource demanding than a virtual machine). The recommended configuration is 4 CPUs and 8 GB of free RAM; however, 2 CPU and 6 GBs of RAM should be enough for our case. Reducing the amount of RAM will make some of the services unavailable.

* Follow along the tutorial to install HDP on docker engine: https://www.cloudera.com/tutorials/sandbox-deployment-and-install-guide/3.html

## Install PySpark for Your Own Jupyter Server:

* Checkout my tutorial on Github: https://github.com/Peilong/PySparkOnJupyter/blob/master/README.md
