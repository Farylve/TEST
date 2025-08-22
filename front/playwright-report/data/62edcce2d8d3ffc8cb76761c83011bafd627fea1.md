# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Portfolio Application" [level=1] [ref=e5]
      - paragraph [ref=e6]: Frontend (Next.js) + Backend (Node.js/Express) Test
    - generic [ref=e7]:
      - heading "API Test Panel" [level=2] [ref=e8]
      - generic [ref=e9]:
        - button "Health Check" [active] [ref=e10]
        - button "Server Info" [ref=e11]
        - button "Test Data" [ref=e12]
        - button "Root" [ref=e13]
      - paragraph [ref=e15]:
        - text: "Current endpoint:"
        - generic [ref=e16]: /api/health
      - generic [ref=e18]:
        - img [ref=e20]
        - generic [ref=e22]:
          - heading "Error" [level=3] [ref=e23]
          - paragraph [ref=e24]: "HTTP error! status: 404"
    - generic [ref=e25]:
      - heading "Connection Status" [level=2] [ref=e26]
      - generic [ref=e27]:
        - paragraph [ref=e28]:
          - generic [ref=e29]: "Frontend:"
          - text: Next.js (Port 3000)
        - paragraph [ref=e30]:
          - generic [ref=e31]: "Backend:"
          - text: Node.js/Express (Port 5000)
        - paragraph [ref=e32]:
          - generic [ref=e33]: "API Base URL:"
  - alert [ref=e34]
```