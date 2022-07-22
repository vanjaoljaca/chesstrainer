# Chess Trainer

React app for drilling chess openings.

### yarn start

## TODO

sprint to launch:
- autoshow arrows first play through?
- !!!! hint after after 3 seconds
- clean up

- transpositions by fen
- submodule select & merge
- hint after after 3 seconds as configurable option duration
- broke carokann
- make too many mistakes an option
- get fen branches in for pin practice etc
- delayed throbbing brain
- create 2 repetoirs
- nicer landing page (view on iphone)
- caro kann is loading as white??
- 'play' module on first open to demonstrate
- play layout and icons, just make it pretty
- pgn load from bulk load

soon:

- https://usehooks-ts.com/react-hook/use-fetch
- builder: current line, target branch
- fix edit name/descriptiion
- load pgp
- breadcrumbs & navigation
- popups for edit screen
- teach mode vs training mode??
- serializing / deserlialization method for moves to remove fluff (part 2)
- fen branch
- when switching sides also...
- method to export from phone to whatever (share)

backlog:

- linq:
  - https://www.npmjs.com/package/linq-typescript
  - https://www.npmjs.com/package/linq-to-typescript
- auto start
- arrows & markers that show lines of attack and which squares are being
  pressured
- edit move comment / name / arrows / targets / notes
- separate moves from statistics
- denote moves that are 'critical line' for theory
- tags for moves
- list possible named targets below current branch
- target branch for trainer
- tags
- fix: bad placement breaks game
- max depth for trainer (teach mode)
- pgn loader
- "answer needed" tag

recently done:
- deploy latest version
- mechanism for keeping pgn files hidden
- persistence type & types clean up & ts strict
- when playing black have to press compute to get white to start
- serializing / deserlialization method for moves to remove fluff (part 1)
- edit mode: selecting moves is broken
- edit mode: get breadcrumsb working!
- lodash
- modules with orientation
- fix non-start computer
- scroll bar on right side
- left side always centered
- save repository to local button
- duplicates are crashing me
- modules
- breadcrumbs view
- add scrolling where needed temporarily (ie div belo)
- back button seems to delete latest line if not saved... (fix duplicates being
  created)
- default option not selectable by ModuleBrowser
- its really ugly
- fix: mistake counter is abrupt
- toggle button to show available moves (brain)
- back on trainer view
- on move, briefly show moves that could have been played
- play white
- delete node
- hint button & hint text
- back 1 move button
- repository dedupe
- bug: auto-play gets stuck when opposite is last move
- fix: click edit does not preserve orientation
- different color arrows
