source "https://rubygems.org"

# Matches the GitHub Pages build environment exactly, so local
# previews render the same as production.
# Docs: https://pages.github.com/versions/
gem "github-pages", group: :jekyll_plugins

# Plugins used by the site (also whitelisted by GitHub Pages)
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
end

# Windows / JRuby timezone data (harmless elsewhere)
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Lock http_parser for older Ruby compatibility
gem "webrick", "~> 1.7"
