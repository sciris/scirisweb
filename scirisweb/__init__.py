'''
Import the key functions required for the webapp.

Example usage:
    import scirisweb as sw
    app = sw.ScirisApp()

Version: 2018oct24
'''

# Import everything
import matplotlib as m
print(m.get_backend())
from .sw_version   import * # analysis:ignore
print(m.get_backend())
from .sw_rpcs      import * # analysis:ignore
print(m.get_backend())
from .sw_users     import * # analysis:ignore
print(m.get_backend())
from .sw_tasks     import * # analysis:ignore
print(m.get_backend())
from .sw_datastore import * # analysis:ignore
print(m.get_backend())
from .sw_app       import * # analysis:ignore
print(m.get_backend())
from .sw_server    import * # analysis:ignore
print(m.get_backend())

# Print the license
print(__license__)