### Product plan

I plan to extend my previous work on the chatbot project, to build it into a fully functional events chatbot that can recommend nearby events to users based on user's prompts and/or their interests. 
I have integrated an external Google Events API as a chatbot tool, now I will focus on turning it into a good product. I will design & implement good ui and user flows.
Some main features that will be developed include:
1. User can tell the chatbot about their interests (either in a given structured form or unstructured chat messages), the app will save these in case user later asks for general event recommendations. 
2. User can ask about what events are happening (eg. outdoor events in nyc this week), the LLM will call the Google Events API with the appropriate params and recommend some event results to user. Work needs to be done to ensure the events are relevant (eg. there's an issue right now with abbreviated location names like 'nyc' not always being passed to the fetch events API so the returned events can be all over the place. maybe there's a way to configure/prompt the LLM so it can always pick up location info from user query, if not may need to resort to a different input format like have user pick from drop down list or fill in blanks, or ask user for validation on the parameters before calling the events API). 
3. The event results should be rendered in a nice way, perhaps in tables, with images and clickable links etc. Also add additional UI/UX improvements like sidebar, light/dark mode, and add additional user features (eg. book mark/save event, event suggestion feedback - positive and/or negative, etc.), or LLM can ask if user wants more event suggestions after each response, if so it should call the Google Events API again and return a different set of events. Add these improvements in if time.

#### Timeline:

Mon - Tue:<br> try resolve the location issue in point 2 above; test LLM for different user prompts / options, make sure it returns good results, may need to try different input formats like drop down, fill in blanks

Wed - Fri:<br> UI/UX improvmenets, eg. implement forgot your password, add more styling, markdown rendering, usage tips like prompt suggestions, and personalization based on user interests and feedback. 

Daily:<br>
Test code with unit & E2E tests with cypress, clean & organize code, add NextJS optimizations if time