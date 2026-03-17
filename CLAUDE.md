# CLAUDE.md - הנחיות לעבודה עם techBoard

## סקירת הפרויקט

אפליקציית React מבוססת **Base44** לניהול תקלות טכניות וטיפולי תחזוקה בכלי טיס (UAV).
הפרויקט כתוב בעברית (RTL) ומשתמש ב-Vite, Tailwind CSS, Shadcn/RadixUI, ו-Base44 SDK.

## פקודות פיתוח

```bash
npm install          # התקנת תלויות
npm run dev          # הרצה מקומית
npm run build        # בנייה לפרודקשן
npm run lint         # בדיקת ESLint
npm run lint:fix     # תיקון אוטומטי של שגיאות lint
```

## Base44 CLI

```bash
npx base44 whoami                # בדיקת משתמש מחובר
npx base44 deploy -y             # דיפלוי מלא (entities, functions, site)
npx base44 entities push         # דחיפת סכמות entities
npx base44 functions deploy      # דיפלוי פונקציות backend
npx base44 agents push           # דחיפת הגדרות agents
npx base44 connectors push       # סינכרון connectors
npx base44 site deploy           # דיפלוי frontend (צריך npm run build לפני)
npx base44 types generate        # יצירת TypeScript definitions (להריץ אחרי שינוי entities)
npx base44 logs                  # צפייה בלוגים של functions
npx base44 link                  # קישור פרויקט קיים לאפליקציית Base44
```

## מבנה הפרויקט

```
src/
├── api/              # Base44 SDK client - אתחול והגדרות
├── components/
│   ├── ui/           # קומפוננטות Shadcn/RadixUI (לא לערוך!)
│   └── faults/       # קומפוננטות דומיין (FaultTable, FaultForm, StatsCards, DashboardCards, StatusBadge)
├── hooks/            # React hooks מותאמים (use-mobile)
├── lib/              # AuthContext, query client, app params, utils
├── pages/            # דפי האפליקציה (כל קובץ = route)
├── utils/            # פונקציות עזר (createPageUrl)
├── pages.config.js   # AUTO-GENERATED - לא לערוך! (רק mainPage ניתן לשינוי)
└── App.jsx           # ראוטינג ראשי ו-auth wrapper

base44/
├── config.jsonc      # הגדרות פרויקט Base44
├── entities/         # סכמות entities (JSON Schema)
├── functions/        # פונקציות serverless (Deno/TypeScript)
├── agents/           # הגדרות AI agents
└── connectors/       # הגדרות OAuth
```

---

## כללי מבנה קבצים - חובה!

1. **אסור לשנות את מבנה התיקיות של Base44** - לא להוסיף/למחוק/לשנות שם תיקיות
2. **אסור להשתמש ב-localStorage** - הפרויקט עובד עם Base44 SDK לניהול נתונים
3. **אסור להשתמש בנתוני mock** - תמיד לעבוד עם ה-SDK האמיתי
4. **`pages.config.js` הוא AUTO-GENERATED** - נוצר ע"י הפלאגין של Base44. אין לערוך מלבד שדה `mainPage`
5. **`src/components/ui/`** - קומפוננטות Shadcn מוכנות. אין לשנות אותן ישירות
6. **`base44/.app.jsonc`** - קובץ פנימי של Base44, לא לגעת

---

## Entities קיימים

### Fault (תקלות)
שדות: `id`, `aircraft_number`, `system`, `description`, `priority`, `status`, `technician_name`, `opened_date`, `closed_date`, `notes`
- סטטוסים: "פתוח", "בטיפול", "ממתין לחלפים", "דחוי", "סגור"
- עדיפויות: "דחוף", "גבוה", "בינוני", "נמוך"
- מערכות: "מנוע", "אביוניקה", "הידראוליקה", "חשמל", "מבנה", "דלק", "נחיתה", "בקרת טיסה", "תקשורת", "אחר"

### DeliveryCertificate (תעודת מסירה)
מסמכי טיסה עם פרטי טיסות pre/post flight (עד מספר טיסות לכל תעודה)

### InstalledComponent (רכיבים מותקנים)
מעקב רכיבי כלי טיס: P/N, S/N, HSBS ועוד

### SpecialPermit (היתרים מיוחדים)
מעקב היתרים רגולטוריים

### MaintenanceProcedure (נוהלי תחזוקה)
דיווחי כשלים ותיקונים (עד 7 רשומות)

### Configuration (תצורה)
תצורת כלי טיס: גרסאות MCU/RSB, HPSB ועוד

### WeightConfig (דף תצורה - משקל ואיזון)
תצורת משקל ודלק לפי 43 ק"ג: שדות לכל תצורה (E180, מגדל, XR, E140) עם/בלי beacon

---

## עבודה עם Base44 SDK

### ייבוא
```javascript
import { base44 } from '@/api/base44Client';
```

### שמות מתודות מדויקים - Entities

```javascript
// שליפה
base44.entities.EntityName.list(sortField)                    // רשימה (ברירת מחדל 50, מקסימום 5000)
base44.entities.EntityName.filter(query, sort, limit, skip)   // סינון עם query
base44.entities.EntityName.get(id)                            // שליפת רשומה בודדת

// כתיבה
base44.entities.EntityName.create(data)           // יצירה
base44.entities.EntityName.update(id, data)       // עדכון
base44.entities.EntityName.delete(id)             // מחיקה
base44.entities.EntityName.deleteMany(query)      // מחיקת רבים
base44.entities.EntityName.bulkCreate(dataArray)  // יצירה מרובה

// real-time
base44.entities.EntityName.subscribe()            // מנוי לשינויים בזמן אמת
```

**שמות שגויים - לא להשתמש!**
- ~~find()~~ ~~findOne()~~ ~~insert()~~ ~~remove()~~ ~~onChange()~~ ~~query()~~

### אימות (Auth)

```javascript
base44.auth.me()                                  // משתמש נוכחי
base44.auth.logout(returnUrl)                     // התנתקות
base44.auth.redirectToLogin(returnUrl)            // הפניה להתחברות
base44.auth.loginViaEmailPassword(email, pass)    // התחברות (לא signIn!)
base44.auth.loginWithProvider('google')           // התחברות עם ספק (לא signInWithGoogle!)
base44.auth.register()                            // הרשמה (לא createUser!)
```

### פונקציות Backend

```javascript
base44.functions.invoke('functionName', data)      // קריאה לפונקציה (לא .call() ולא .run()!)
```

### אינטגרציות מובנות

```javascript
base44.integrations.Core.InvokeLLM(params)                    // קריאה ל-AI
base44.integrations.Core.SendEmail(params)                    // שליחת מייל
base44.integrations.Core.UploadFile(params)                   // העלאת קובץ
base44.integrations.Core.GenerateImage(params)                // יצירת תמונה
base44.integrations.Core.ExtractDataFromUploadedFile(params)  // חילוץ מידע מקובץ
```

---

## ניווט (Routing)

```javascript
import { createPageUrl } from '@/utils';
import { useNavigate, Link } from 'react-router-dom';

// ניווט עם פרמטרים - תמיד query params, לא path params!
createPageUrl("PageName")                         // "/PageName"
createPageUrl("PageName") + "?tail=123"           // "/PageName?tail=123"

// שימוש
const navigate = useNavigate();
navigate(createPageUrl("FaultBoard"));
<Link to={createPageUrl("UAVTailNumber")}>...</Link>
```

**דפים קיימים:** FaultBoard, UAVTailNumber, DeliveryCertificate, InstalledComponents, SpecialPermits, MaintenanceProcedures, Configuration, WeightConfig

---

## דפוסי קוד וקונבנציות

### תאריכים
- כל פעם שיוצג תאריך הוא יוצג ב DD/MM/YY (פורמט ישראלי)
- שמירה בפורמט ISO (YYYY-MM-DD), תצוגה בפורמט `value.split('-').reverse().join('/')`
- שימוש ב-hidden date picker: `<Input type="text" readOnly>` + `<input type="date" className="absolute inset-0 opacity-0">`

### RTL ועברית
- האפליקציה בעברית מלאה
- להוסיף `dir="rtl"` לקונטיינרים ראשיים
- UI labels ותוכן בעברית

### עיצוב
- **Tailwind CSS בלבד** - לא להוסיף קבצי CSS חדשים
- **lucide-react** לאייקונים בלבד (לא SVG מותאמים)
- צבעים: כחול (primary), ירוק (success), אדום (danger), צהוב (warning)
- Cards עם `shadow` ו-`rounded-lg`

### מבנה דף טיפוסי
```jsx
export default function PageName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await base44.entities.EntityName.list();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="p-6 space-y-6">
      {/* Header עם כותרת ואייקון */}
      {/* פילטרים/חיפוש */}
      {/* תוכן ראשי (טבלה/כרטיסים) */}
      {/* Dialog modal לטופס יצירה/עריכה */}
    </div>
  );
}
```

### טפסים
- `useState` לניהול state של טופס
- עדכון שדה: `setForm({...form, fieldName: value})`
- Dialog wrapper למודאל
- אחרי submit: קריאת API ואז reload מלא של הנתונים

### שמות שדות
- snake_case לשדות בבסיס הנתונים
- PascalCase לשמות קומפוננטות וקבצי pages
- camelCase לפונקציות ומשתנים

### ספריות בשימוש
- React 18.2 + React Router v6
- TanStack React Query (server state)
- react-hook-form + zod (ולידציה)
- date-fns (תאריכים)
- html2canvas + jspdf (ייצוא PDF)
- clsx + tailwind-merge (ניהול classes)

---

## סינכרון עם Base44

- כל push ל-`main` משתקף אוטומטית ב-Base44 Builder
- שינויים ב-Base44 Builder עושים auto-commit ל-GitHub
- **לוודא שהקוד תקין לפני push!**
- branch ראשי חייב להיקרא `main` (לא `master`)
- אחרי שינוי entities: להריץ `npx base44 types generate`

## משתני סביבה

נדרשים בקובץ `.env.local`:
- `VITE_BASE44_APP_ID`
- `VITE_BASE44_APP_BASE_URL`
