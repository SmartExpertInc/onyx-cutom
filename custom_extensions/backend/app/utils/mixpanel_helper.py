from mixpanel import Mixpanel
import os
 
mp = Mixpanel(token=os.getenv("MIXPANEL_TOKEN"))


def track_to_mp(onyx_user_id, event_name, properties):
    mp.track(onyx_user_id, event_name, properties)
