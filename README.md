# LinuxServer IO - Emby HappyMod

This is only used for research and learning purposes. Please do not use this in production or sale it as your own work.

# Credits

- Original work by: https://github.com/2017fighting/docker-mods/blob/emby-crack/Program.cs licensed under GPL v3.
- Thanks to LinuxServer.io for Docker Mod mechanism and their template under: https://github.com/linuxserver/docker-mods

# License 

GNU AGPL v3

# Original Project README

# Emby Crack - Docker mod for Emby

> Get Emby Premiere For Free，Method Referrence from [here](https://yubanmei.com/archives/133.html)

## Usage
1. You must use base image from [LinuxServer.io Emby](https://hub.docker.com/r/lscr.io/linuxserver/emby)
2. Host your own authorization server [here](#Build Authorization Service by yourself)
3. Change `DOCKER_MODS` and add `EMBY_CRACK_URL` environment variable correspondingly
```diff
services:
  emby:
    image: lscr.io/linuxserver/emby:latest
    environment:
-      DOCKER_MODS: other-docker-mod
+      DOCKER_MODS: other-docker-mod|ghcr.io/username/emby-happymod:version
+      EMBY_CRACK_URL: https://embycrack.sample.com   # replace with your own URL
```

## Host Authorization Server Yourself

Sample of building with [caddyServer](https://caddyserver.com/)

```Caddyfile
(cors) {
        @cors_preflight{args[0]} method OPTIONS
        @cors{args[0]} header Origin {args[0]}
        handle @cors_preflight{args[0]} {
                header {
                        Access-Control-Allow-Origin {args[0]}
                        Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
                        Access-Control-Allow-Headers *
                        Access-Control-Max-Age 3600
                        defer
                }
                respond 204
        }
        handle @cors{args[0]} {
                header {
                        Access-Control-Allow-Origin {args[0]}
                        Access-Control-Expose-Headers *
                        defer
                }
        }
}

(cors_any) {
        @cors_preflight method OPTIONS

        header {
                Access-Control-Allow-Origin "{header.origin}"
                Vary Origin
                Access-Control-Expose-Headers "Authorization"
                Access-Control-Allow-Credentials "true"
        }

        handle @cors_preflight {
                header {
                        Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE"
                        Access-Control-Max-Age "3600"
                }
                respond "" 204
        }
}

# replace with your own domain
embycrack.sample.com {
    # CORS settings, choose either cors or cors_any
    import cors_any
    #import cors "https://emby.sample.com" 

    respond /admin/service/registration/validateDevice `{"cacheExpirationDays":3650,"message":"Device Valid","resultCode":"GOOD"}`

    respond /admin/service/registration/validate `{"featId":"MBSupporter","registered":true,"expDate":"2099-01-01","key":"114514"}`

    respond /admin/service/registration/getStatus `{"deviceStatus":"","planType":"Lifetime","subscriptions":{}}`

    respond /admin/service/appstore/register `{"featId":"","registered":true,"expDate":"2099-01-01","key":""}`

    respond /emby/Plugins/SecurityInfo `{"SupporterKey":"","IsMBSupporter":true}`
}
```
