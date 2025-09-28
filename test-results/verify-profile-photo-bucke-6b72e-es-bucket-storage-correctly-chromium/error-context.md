# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e10]: Tech Portal
      - generic [ref=e11]: Enter your 6-digit access code to continue
    - generic [ref=e12]:
      - alert [ref=e13]:
        - generic [ref=e14]: Invalid login code
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: Access Code
          - textbox "Access Code" [ref=e18]: TECH001
          - paragraph [ref=e19]: "Example: 8D0LS9"
        - button "Enter Dashboard" [ref=e20]:
          - img
          - text: Enter Dashboard
      - generic [ref=e24]: or
      - button "Login with Email & Password" [ref=e25]:
        - img
        - text: Login with Email & Password
      - generic [ref=e26]:
        - generic [ref=e27]:
          - paragraph [ref=e28]: "Quick Access Instructions:"
          - list [ref=e29]:
            - listitem [ref=e30]: 1. Enter your 6-digit code (e.g., 8D0LS9)
            - listitem [ref=e31]: 2. Press "Enter Dashboard"
            - listitem [ref=e32]: 3. Start submitting jobs immediately
        - paragraph [ref=e33]: Don't have a code? Contact your franchise manager.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e39] [cursor=pointer]:
    - img [ref=e40] [cursor=pointer]
  - alert [ref=e43]
```