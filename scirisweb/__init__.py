'''
Import the key functions required for the webapp.

Example usage:
    import scirisweb as sw
    app = sw.ScirisApp()

Version: 2020mar13
'''

# Import everything
from .sw_version   import * # analysis:ignore
from .sw_rpcs      import * # analysis:ignore
from .sw_users     import * # analysis:ignore
from .sw_tasks     import * # analysis:ignore
from .sw_datastore import * # analysis:ignore
from .sw_app       import * # analysis:ignore
from .sw_server    import * # analysis:ignore

# Print the license...or not
# print(__license__)