# conf.py

import os
import sys
sys.path.insert(0, os.path.abspath('.'))

# -- Project information -----------------------------------------------------

project = 'Your Project Name'
author = 'Your Name'
version = '1.0'
release = '1.0.0'

# -- General configuration ---------------------------------------------------

extensions = [
    'sphinx.ext.autodoc',       # Automatically generate API documentation
    'sphinx.ext.viewcode',      # Add links to source code
    'sphinx.ext.napoleon',      # Support for Google-style docstrings
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# -- Options for HTML output -------------------------------------------------

html_theme = 'alabaster'  # You can choose a different theme if desired
html_static_path = ['_static']

# -- Options for autodoc extension -------------------------------------------

autodoc_default_options = {
    'members': True,          # Include class and module members in documentation
    'undoc-members': True,    # Include members without docstrings
    'show-inheritance': True, # Show class inheritance diagrams
}

# -- Options for napoleon extension ------------------------------------------

napoleon_numpy_docstring = True  # Use NumPy-style docstrings

# -- Options for HTMLHelp output ---------------------------------------------

htmlhelp_basename = 'YourProjectDoc'

# -- Other settings ----------------------------------------------------------

# Add any additional settings or configurations here

