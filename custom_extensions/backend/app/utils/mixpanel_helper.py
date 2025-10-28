from mixpanel import Mixpanel
import os
 
mp = Mixpanel(token=os.getenv("MIXPANEL_TOKEN"))


def track_to_mp(request, event_name, properties):
    mp.track(request.user_id, event_name, properties)