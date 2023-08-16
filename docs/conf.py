# -*- coding: utf-8 -*-
#
# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

import os
import sys
sys.path.insert(0, os.path.abspath('../../'))


# -- Project information -----------------------------------------------------

project = 'coffee-hub'
copyright = '2023, Felix Rampf'
author = 'Felix Rampf'


# -- General configuration ---------------------------------------------------

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx_copybutton',
    'myst_parser',
]

templates_path = ['_templates']
root_doc = 'index'
exclude_patterns = []

# The name of the Pygments (syntax highlighting) style to use.
pygments_dark_style = 'nord'


# -- Options for HTML output -------------------------------------------------

html_theme = 'furo'
html_static_path = ['_static']


# -- Extension configuration -------------------------------------------------

# autoclass_content = 'both'
autodoc_class_signature = 'separated'
autodoc_member_order = 'bysource'
autodoc_typehints = 'description'
autodoc_typehints_description_target = 'documented'

def autodoc_skip_member(app, what, name, obj, skip, options):
    # Include __call__ in docs
    if name in ['__call__']:
        return False
    return skip

def setup(app):
    app.connect('autodoc-skip-member', autodoc_skip_member)
