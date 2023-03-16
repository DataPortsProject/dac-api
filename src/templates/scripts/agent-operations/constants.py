#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
# -- Environmental variables
RANDOM_ID = os.getenv(
    "RANDOM_ID", "9[2!H.]%).5-5@5U3U|[(#.+Dp%IS(F@_O+_I0<B$WE]{'Q*3<A:|E3.['2?N^Z&")
PRIVATE_REPOSITORY = True
URL_PUBLIC_REPOSITORY = ""
PROJECT_NAME_PRIVATE_REPOSITORY = "datamodel"
LINK_PRIVATE_REPOSITORY = "Posidonia/PosidoniaEvent/schema.json"
RABBIT_TOPIC_NAME = "dataports_eventjson_queue"

EVENT_TYPE_1 = "AIS_IN"
EVENT_TYPE_2 = "WAYPOINT"
EVENT_TYPE_3 = "STOP_OVER_IN"
EVENT_TYPE_4 = "ANCHOR_IN"
EVENT_TYPE_5 = "ANCHOR_OUT"
EVENT_TYPE_6 = "PILOT_START"
EVENT_TYPE_7 = "TUG_START"
EVENT_TYPE_8 = "DOCK_STOP"
EVENT_TYPE_9 = "DOCK_STOP_START"
EVENT_TYPE_10 = "DOCK_START_OUT"
EVENT_TYPE_11 = "PILOT_AWAY"
EVENT_TYPE_12 = "TUG_AWAY"
EVENT_TYPE_13 = "STOP_OVER_OUT"
EVENT_TYPE_14 = "AIS_OUT"
EVENT_TYPE_15 = "OIL_START"
EVENT_TYPE_16 = "OIL_STOP"
EVENT_TYPE_17 = "ANCHOR_IN_START"
EVENT_TYPE_18 = "FORBIDDEN_ANCHOR_IN"
EVENT_TYPE_19 = "DOCK_RESTOP"
EVENT_TYPE_20 = "AIS_SWITCHED_OFF"
EVENT_TYPE_21 = "AIS_SWITCHED_ON"
EVENT_TYPE_22 = "AIS_FREQUENCY_TOO_LOW"
EVENT_TYPE_23 = "ANCHOR_REIN"
EVENT_TYPE_24 = "DOCK_APPROACH"
EVENT_TYPE_25 = "CONTROL_ZONE_IN"
EVENT_TYPE_26 = "CONTROL_ZONE_OUT"
EVENT_TYPE_27 = "SPEED_LIMIT_EXCEEDED"
EVENT_TYPE_28 = "ACNHOR_OUT_ASSUMED"

EVENT_TYPES = [EVENT_TYPE_1, EVENT_TYPE_2, EVENT_TYPE_3,
               EVENT_TYPE_4, EVENT_TYPE_5, EVENT_TYPE_6, EVENT_TYPE_7, EVENT_TYPE_8, EVENT_TYPE_9, EVENT_TYPE_10, EVENT_TYPE_11, EVENT_TYPE_12, EVENT_TYPE_13, EVENT_TYPE_14,
               EVENT_TYPE_15, EVENT_TYPE_16, EVENT_TYPE_17, EVENT_TYPE_18, EVENT_TYPE_19, EVENT_TYPE_20, EVENT_TYPE_21, EVENT_TYPE_22, EVENT_TYPE_23, EVENT_TYPE_24, EVENT_TYPE_25,
               EVENT_TYPE_26, EVENT_TYPE_27, EVENT_TYPE_28]

"""
0 to 9not_available
10reserved_for_future_use,all_ships_of_this_type
11reserved_for_future_use,_Hazardous_category_A
12reserved_for_future_use, _Hazardous_category_B
13reserved_for_future_use, _Hazardous_category_C
14reserved_for_future_use, _Hazardous_category_D
15reserved_for_future_use,_Not_under_command
16reserved_for_future_use,_Restristed_by_her_ability_to_maneuver
17reserved_for_future_use,_Constrained_by_her_draught
18reserved_for_future_use,_Spare
19reserved_for_future_use,_No_aditional_information
20wing_in_ground_(WIG),_all_ships_of_this_type
21wing_in_ground_(WIG),_Hazardous_category_A
22wing_in_ground_(WIG),_ Hazardous_category_B
23wing_in_ground_(WIG),_ Hazardous_category_C
24wing_in_ground_(WIG),_ Hazardous_category_D
25wing_in_ground_(WIG),_Reserved_for_future_use
26wing_in_ground_(WIG),_ Reserved_for_future_use
27wing_in_ground_(WIG),_ Reserved_for_future_use
28wing_in_ground_(WIG),_ Reserved_for_future_use
29wing_in_ground_(WIG),_ Reserved_for_future_use
30fishing
31towing
32towing_length_exceeds_200m_or_breadth_exceeds_25m
33dredging_or_underwater_ops
34diving_ops
35military_ops
36sailing
37pleasure_craft
38reserved
39reserved
40high_speed_craft_(HSC),_all_ships_of_this_type
41high_speed_craft_(HSC),_Hazardous_category_A
42high_speed_craft_(HSC),_ Hazardous_category_B
43high_speed_craft_(HSC),_ Hazardous_category_C
44high_speed_craft_(HSC),_ Hazardous_category_D
45high_speed_craft_(HSC),_Reserved_for_future_use
46high_speed_craft_(HSC),_ Reserved_for_future_use
47high_speed_craft_(HSC),_ Reserved_for_future_use
48high_speed_craft_(HSC),_ Reserved_for_future_use
49high_speed_craft_(HSC),_No_additional_information
50pilot_vessel
51search_and_rescue_vessel
52tug
53port_tender
54vessel_with_anti_pollution_equipment
55law_enforcement_vessel
56spare_-_for_assignments_to_local_vessels
57spare_-_for_assignments_to_local_vessels
58medical_transport
59ship_according_to_RR_resolution_No._18
60passenger,_all_ships_of_this_type
61passenger,_Hazardous_category_A
62passenger,_Hazardous_category_B
63passenger,_Hazardous_category_C
64passenger,_Hazardous_category_D
65passenger,_not_under_command
66passenger,_Restricted_by_her_ability_to_maneuver
67passenger,_Constrained_by_her_draught
68passenger,_Spare
69passenger,_no_additional_information
70cargo,_all_ships_of_this_type
71cargo,_Hazardous_category_A
72cargo,_Hazardous_category_B
73cargo,_Hazardous_category_C
74cargo,_Hazardous_category_D
75cargo,_not_under_command
76cargo,_Restricted_by_her_ability_to_maneuver
77cargo,_Constrained_by_her_draught
78cargo,_Spare
79cargo,_No_additional_information
80tanker,_all_ships_of_this_type
81tanker,_Hazardous_category_A
82tanker,_Hazardous_category_B
83tanker,_Hazardous_category_C
84tanker,_Hazardous_category_D
85tanker,_not_under_command
86tanker,_Restricted_by_her_ability_to_maneuver
87tanker,_Constrained_by_her_draught
88tanker,_Spare
89tanker,_No_additional_information
90other_type,_all_ships_of_this_type
91other_type,_Hazardous_category_A
92other_type,_ Hazardous_category_B
93other_type,_ Hazardous_category_C
94other_type,_ Hazardous_category_D
95other_type,_not_under_command
96other_type,_Restricted_by_her_ability_to_maneuver
97other_type,_Constrained_by_her_draught
98other_type,_Spare
99other_type,_No_addtional_information
"""
# TODO: refactor vessel_types into a dictionary
VESSEL_TYPE_0_TO_9 = "NOT_AVAILABLE"
VESSEL_TYPE_52 = "TUG"
VESSEL_TYPE_74 = "CARGO,_HAZARDOUS_CATEGORY_D"

# BASE_URL = '127.0.0.1'
# BASE_URL = 'host.docker.internal'
BASE_URL = '172.17.0.1'
API_URL = f'http://{BASE_URL}:3000'


class switch:

    def __init__(self, variable, comparator=None, strict=False):
        self.variable = variable
        self.matched = False
        self.matching = False
        if comparator:
            self.comparator = comparator
        else:
            self.comparator = lambda x, y: x == y
        self.strict = strict

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def case(self, expr, break_=False):
        if self.strict and self.matched:
            return False
        if self.matching or self.comparator(self.variable, expr):
            if not break_:
                self.matching = True
            else:
                self.matched = True
                self.matching = False
            return True
        else:
            return False

    def default(self):
        return not self.matched and not self.matching
