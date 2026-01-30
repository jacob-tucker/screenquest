I would like to create a DePIN application that collects screen recording data. On this application, users are prompted to start recording their screen, visit a specific webpage, browse the webpage and achieve a specific outlined task, and then stop the recording. The recording is then published to a database (preferably Supabase), and the user receives points for doing so.

I came up with this idea because of an app called Poseidon. This is a audio data DePIN app where there are various "campaigns", and users can select a campaign and be taken through an instructions process where they turn on their mic, read a prompt, talk into the phone/computer, and stop recording. The audio data is then saved.

The user should be able to log in with Google. That's the only login option for now. I have already set up a Google web client and all that. I just need instructions on adding to supabase and stuff.

Admins (aka me) should be able to add new campaigns. A campaign should have a website URL, and a small description of what the user should achieve. It will be an overall description, like "Submit a form on the billing page", and the user has to figure it out for themselves.

Like I described, the user will basically go into a campaign, have a brief instructions flow that helps them get ready, and then click start recording. It should start a screen recording, prompt them to share their window, and then take them to the website (maybe a button or something).

When they start recording, we should have an overlay in the bottom right corner of the screen that persists between tabs while theyre recording. Kind of like what google meet does when youre switching into other tabs.

You can use the frontend-design skill. I want to prioritize everything being super slick, CONCISE, and tight. Small. Don't have bloated style with huge padding and all that.

I also have an empty supabase project set up. Just need you to create a sql for me to run so I can get everything set up in there. Also, recordings should be stored in supabase, and private, only admins can view them. Thank you!

If an admin approves a submission, user gets the points.

Can you please come up with an expert plan to achieve this? Thank you!
