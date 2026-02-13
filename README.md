# Noxus Website

This project is a Jekyll website.

## Run Locally

From the project root:

```bash
cd /Users/nereu/Code/noxus-website
gem install bundler:4.0.3
bundle _4.0.3_ install
bundle _4.0.3_ exec jekyll serve --livereload
```

Open:

`http://127.0.0.1:4000`

## If Ruby/Bundler Fails on macOS System Ruby

If you see version issues with macOS system Ruby (`2.6.x`), use `rbenv` with a newer Ruby:

```bash
brew install rbenv ruby-build
rbenv install 3.2.2
rbenv local 3.2.2
gem install bundler:4.0.3
bundle _4.0.3_ install
bundle _4.0.3_ exec jekyll serve --livereload
```
