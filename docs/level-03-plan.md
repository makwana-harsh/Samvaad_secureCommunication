# Page 1
##  Home

  * header section : 
    * header section contains web-app symbol, navber to navigate between three screens, logout button

  * profile section : 
    * profile section contains some user information like username, friends number.
    * It contains edit button, that redirect user to a page that is not a component. It is like a form that take all the information.
    * Information : profile pic, name, username, mobile no, DOB, location etc
    * that page contains a save button , that save all the data and again redirect user to the page 1 (home screen)

  * end section :
    * It contains online users list component
    * Incoming user's request list component


---


# Page 2 
## Conversations (page-2.png) (old name was `Friends & Groups`)
 
### Navbar
  * It contains two options :- 
  1. Friends & Groups
  2. Temporary Conversations

### Friends & Groups
  * Contains list of cards of friend users
  * It has two types of cards : one for friends & second for groups

### Temporary Conversations
  * Contains list of chats of non-friend users
  * It has third type of card that represent non-friend user conversation

### Components 
### cards 
  * For group of friends
  * For single friend
  * For non-friend user

  * A card has two sections : image section and remaining portion
  * A card include user profile picture setteled by user or group admin
  * Clicking on that profile picture, shows that picture in big screen  (for non-friend user, profile page does not provide full information)

  * Clicking on remaining portion load chat box
  * remaing portion contains last message with time (except non-friend user, non-friend user chat card does not provide this feature)
  * online/offline indicator (except non-friend user, non-friend user chat card does not provide this feature)

### chat box :- 
  * header with profile picture and username 
  * clicking the profile picture open that image
  * clicking on the remaining portion of that header open a new component (name : detailed infor component).
  * middle section is used to show (or list) all the messages
  * footer section used to type and send messages or files or images/videos.

### Detailed info component :-
  * this new component contains all the info about that user or group(except for non-friend user, it contains info but allowed only info)
  * it contains a button "block" to block messages coming from that friend-non friend user or group 
  * also "unblock" button to again start conversation
  * "back" button to go again chat box


## Types of users in page 2
* Friend users
* non-friend users

### Friends users
* Friends can see Mobile Number, Email, Location (if shared), Birthday (optional) (location, mobile no are private data, risk to disclose infront of unknown user)
* In Detailed info component, a user can see all the info of friend user in his profile
* On friends user card, user can see online status, last seen, online/offline status, last message
* Stores all the conversations permanently (images, videos, pdfs, files, text)
* Also more benefits will be coming soon

### Non-Friends users
* Non-Friends users can not see Mobile Number, Email, Location (if shared), Birthday (optional)
* In Detailed info component, a user can not see all the info of non-friend user in his profile
* On non-friends user card user can not see online status, last seen, online/offline status, last message
* cards created when we first time send the message to a non-friend.
* conversations will stay for limited time of period (for 20-30 days)
* After the time expired, those conversation will automatically deleted either those are images, videos, files etc with card itself.
* After becoming a friend, all the conversations become permanent

* These features encourge non-friend users to become a friend, also save storage from big files, images, videos data
* It clearly defines the difference between friend and non-friend users


---


# Pag3
## Discover 

  * search-bar :- 
    * used to search users on the platform
  
  * list of all the currently users across the platform in the form of card
   * that card contains option to send request to that user



# Cards (new update - 26-08-2026)
## three types of cards
### friend single user card   
### non-friend single user card   
### group card

### Important : These card rules apply to every page (navigated screen)