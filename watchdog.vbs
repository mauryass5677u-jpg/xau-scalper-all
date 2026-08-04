' XAU/USDT Terminal watchdog — launched hidden at Windows login
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "C:\Users\vm587\Documents\Default Project"
sh.Run """C:\Program Files\nodejs\node.exe"" ""C:\Users\vm587\Documents\Default Project\watchdog.js""", 0, False
