+++
# Latest ADAL news (compact). Replaces the large ADAL hero banner.
# Rendered by layouts/partials/widgets/adal_news.html from the lab site's RSS feed.
widget = "adal_news"
headless = true  # This file represents a page section.
active = true  # Activate this widget? true/false
weight = 15  # Right after the Biography (about = 10).

title = "Latest News"
subtitle = "From the [ADAL lab](https://bluejayadal.github.io/)"

feed = "https://bluejayadal.github.io/post/index.xml"
count = 5
more_url = "https://bluejayadal.github.io/post/"

[advanced]
  # Roughly a third of the default section padding (110px) so the section stays compact.
  css_style = "padding-top: 40px; padding-bottom: 40px;"
+++
