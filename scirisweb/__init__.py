'''
Import the key functions required for the webapp.

Example usage:
    import scirisweb as sw
    app = sw.ScirisApp()

Version: 2018oct24
'''

# Import everything
from .sc_version   import * # analysis:ignore
from .sc_rpcs      import * # analysis:ignore
from .sc_users     import * # analysis:ignore
from .sc_tasks     import * # analysis:ignore
from .sc_datastore import * # analysis:ignore
from .sc_app       import * # analysis:ignore
from .sc_server    import * # analysis:ignore

# Print the license
print(__license__)