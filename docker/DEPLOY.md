# Hosting on frigates.socketkill.com

1. DNS: add an `A` record `frigates` -> your server's IP (or a CNAME to it).
2. On the server, from the repo root:
   ```sh
   docker compose up -d --build
   ```
   The site listens on `127.0.0.1:3000`.
3. Put a reverse proxy in front for HTTPS. Simplest is Caddy (auto Let's Encrypt), `/etc/caddy/Caddyfile`:
   ```
   frigates.socketkill.com {
       reverse_proxy 127.0.0.1:3000
   }
   ```
   Or nginx:
   ```
   server {
       server_name frigates.socketkill.com;
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   then `certbot --nginx -d frigates.socketkill.com`.
4. Update: `git pull && docker compose up -d --build`.

The server needs outbound HTTPS to zkillboard.com and esi.evetech.net for the counters page.
