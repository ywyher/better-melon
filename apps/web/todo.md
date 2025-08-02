check whereever you use currentTime and see if it causes any performance issues

add more options for the delay like custom inputs

check if search functioanlity works for romanjin and native

maybe change the player loading strategy to idle

header search component uses a custom query, change it to the global one

GET_ANIME query is kinda a mess rn

on resizing the it shows the loading state for some reason prob cuz isVideoReady which result in the player returning back to 0:00 fix this shit

transcriptinos selector doesn't seeem to work lol most likely cuz we have english japanese hiragana to always be there, but they should be visable of they are removed dumbass me

check your words list button ?

for the words part we are creating an entry for each word i think that is a bit expensive be try one entry with one field having all the word if that is better

the home page should be introduction to the site and add an option to redirect to the animes page right away in the settings

check https://github.com/Doublevil/JmdictFurigana

# Features
1. add a button on the panel to take you to the current active cue
5. puase player on definition trigger or hover or click or none !!!!
6. later add a protips page or something to show tips like the ctrl + c copy the current cue text !! or basically a hotkeys instructions when we add the rest (if there is)
7. begin where you left off > save where the user ended last time they watched a certain episode
>   maybe the best way to implement this is to save watched episode an a history table and each video with its own how much the user have seen of it
8. add the ability to disable auto scroll to the current cue and the ability to customize the
9. countdown when the user is scrolling before it returns to the current cue
10. watch or info page
>    Choose whether to go to the info page or watch page when selecting an anime.
11. auto add to list
12. input validation/sanitization for login/register
13. episodes metadata for the episode selector
14. preview subtitle for when the settings change (not important)
15. add extra option for the compact mode for the definition-card like sentences and such
16. maybe add furigana for definition card (prob not)
17. google text-to-speech in the defintion-card (prob not)

# Migaku features i wanna add (why am i torturing my self)
1. if clicking shift and hover over a word show the definition card
2. knowns words => import from anki
3. if already have a card show in the ui, prob not
4. shortcuts ahhh
5. ability to search anki deck for a word via a button as well as a hotkey (ctrl + alt + c)
6. ability to hide the subtitles without removing transcriptions from the select list 
7. these hotkeys
- A to play the previous subtitle
- D to play the next subittle
- S to replay the current subitlte
- W to hide the subtitles
- Q to mine a a word -> check the whole subtitle and only create a card for the unknown words
8. the ability to create multiple card at once (hard one, later ig)
- how this works is that it create multiples cards for each unknown word in the select subititles
9. built in card creator instead of having an option to show anki GUI (hard one, later ig)
- the benift from this is that the user can have a dictionary opened at the same time in case he want to look something up
10. if a word is not parsed correctly you should be able to click a button or shortcut that will search the longest word first from the kanji we have in the current subtitle
11. mass export cards that will check the whole subtitle file and add cards for unknown words (hard, later ig)
12. instead of having a furigana transcription on its own, add the option to show it based on the word status and do it just in the japanese transcription

as for known words should we allow user to manually add to the database,
or only the words that he have in his anki deck !!!
prob manually as well as the ability to import from an anki deck ?
we should have these types (add an option for the user to disable this)
1. unknown -> red
2. tracking/learning -> orange
3. known -> green => only on hover
4. ignore -> gray => only on hover
if a word is unknown or tracker => show furigana
each should have its own styling
should have hotkeys: 
1. 1 mark as unknwn
2. 2 mark as tracking and so on

# Bugs
1. getSentencesForCue delay doesnt really work well with delay
2. so when we log as anon we should invalidate the session query
3. check the index>header file for an error with the dialog wrapper
4. dialog z-index > toast z-index => bad UX i suppose it can be fixed using createPortal from react
5. color picker doesnt set the color in styles
6. add to anki doesn't work from the panel since we dunno how to capture an image of the selected cue timestamp yet
7. still tokenizing of tokenizer not in redis and not in memory
 
# Notes
1. there is built-in getAccessToken no need to listAccountsWithFullData on anilist !!
2. we changed how displayValue works in the use-styles-controller maybe in the others too ?
3. sometimes the proxy fails -> maybe add a refetch or something in that case
4. update the skeletons for general settings and subtitle styles since you chagned the content
5. maybe on the info page if its an anime of 1 episodes just prefetch it right away
6. use cache for session which are being fetched from the server ??
7. check turoborepo
8. for schedules dont use anilist its based on japanese tv
9. some settings that uses onBlur to update, make sure to only update if value changed
10. check https://www.anthropic.com/jobs?team=4002061008 smooth logo effect when scrolling
11. check this proxy https://github.com/titaniumnetwork-dev/Ultraviolet
12. check this proxy https://github.com/MercuryWorkshop/scramjet/

# Checkout

look at this repo: https://github.com/ripose-jp/Memento
they have more dictionaries for stuff like pitch accent and so on

this too for more info about pitch accent databases
https://github.com/IllDepence/anki_add_pitch_plugin/tree/master/src
https://github.com/Ben-Kerman/anki-jrp
https://github.com/javdejong/nhk-pronunciation

try this for animepahe ?
https://github.com/ElijahCodes12345/animepahe-api

useful for domains and vps shit:
https://my.hivelocity.net/sign-up?referralCode=JKUA
https://jink.host/
https://regery.com/
https://receive-smss.com/

check out
1- https://github.com/shaka-project/shaka-player
2- https://github.com/zhw2590582/ArtPlayer

Heiban
Atamadaka
Nakadaka
Odaka
Color words to show their respective pitch patterns:
あ - 1 mora
おう - 2 moras
せんせい - 4 moras
*A mora is a single unit of sound in the Japanese language

Heiban “flat board” (blue)
Rises after first mora*; pitch stays high and doesn’t drop

Atamadaka “head high” (red)
Pitch starts high but drops after the first mora

Nakadaka “middle high” (orange)
Pitch drops somewhere in the center of the word and ends low

Odaka “tail high” (green)
Pitch drops after the last mora at the beginning of the next word
