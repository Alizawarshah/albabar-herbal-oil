# البابر Herbal Oil

Online shop for البابر Herbal Oil: desi herbal hair oil with free delivery and Cash on Delivery across Pakistan.

- **Website:** plain HTML, CSS and JavaScript (no build step). English and Urdu.
- **Backend:** Supabase (products, orders, customer accounts, contact messages).
- **Hosting:** Cloudflare Pages, published automatically from this repository's `main` branch.

## Where to change things
| What | File |
|---|---|
| Prices, products, photos, hero image, WhatsApp number, social links, all English/Urdu text | `js/data.js` |
| Supabase connection (publishable key only, safe to be public) | `js/supabase-config.js` |
| Colours, fonts, layout | `css/style.css` (rules in `design-system/MASTER.md`) |
| Your own photos | put them in `Images/` and point to them in `js/data.js` |

Shop owner admin panel: `/admin.html` (only accounts listed in the database `admins` table can use it).

Never put the Supabase **secret / service_role** key in any file in this repository.
