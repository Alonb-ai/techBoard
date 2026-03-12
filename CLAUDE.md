# CLAUDE.md - הנחיות לעבודה עם הריפו

## סקירת הפרויקט

אפליקציית React מבוססת **Base44** לניהול תקלות טכניות במטוסים (FaultBoard).
הפרויקט כתוב ב-Hebrew/RTL ומשתמש ב-Vite, Tailwind CSS, ו-Shadcn/RadixUI.

## פקודות פיתוח

```bash
npm install          # התקנת תלויות
npm run dev          # הרצה מקומית
npm run build        # בנייה לפרודקשן
npm run lint         # בדיקת ESLint
npm run lint:fix     # תיקון אוטומטי של שגיאות lint
```

## מבנה הפרויקט

```
src/
├── api/              # Base44 SDK client - אתחול והגדרות
├── components/
│   ├── ui/           # קומפוננטות Shadcn/RadixUI (לא לערוך ידנית)
│   └── faults/       # קומפוננטות דומיין - טבלאות, טפסים, דשבורדים
├── hooks/            # React hooks מותאמים
├── lib/              # Auth context, query client, app params
├── pages/            # דפי האפליקציה (FaultBoard, Home, Configuration...)
├── utils/            # פונקציות עזר (createPageUrl)
├── pages.config.js   # AUTO-GENERATED - לא לערוך! (רק mainPage ניתן לשינוי)
└── App.jsx           # ראוטינג ראשי
```

## עבודה עם Base44 SDK

### ישויות (Entities) - CRUD
```javascript
import base44 from '@/api/base44Client';

base44.entities.Fault.list(sortField)    // שליפת רשימה
base44.entities.Fault.create(data)       // יצירה
base44.entities.Fault.update(id, data)   // עדכון
base44.entities.Fault.delete(id)         // מחיקה
```

### אימות (Auth)
```javascript
base44.auth.me()                          // משתמש נוכחי
base44.auth.logout()                      // התנתקות
base44.auth.redirectToLogin(returnUrl)    // הפניה להתחברות
```

## כללים חשובים

- **pages.config.js הוא AUTO-GENERATED** — נוצר ע״י הפלאגין של Base44. אין לערוך אותו מלבד שדה `mainPage`.
- **קומפוננטות ui/** — קומפוננטות Shadcn מוכנות. אין לשנות אותן ישירות, להשתמש בהן כמו שהן.
- **RTL** — האפליקציה בעברית. יש להוסיף `dir="rtl"` לאלמנטים חדשים לפי הצורך.
- **State Management** — שימוש ב-React Context לאימות, ו-TanStack React Query לנתונים מהשרת.
- **סגנון** — Tailwind CSS בלבד. לא להוסיף CSS קבצים חדשים.
- **אייקונים** — שימוש ב-`lucide-react` בלבד.
- **סינכרון עם Base44** — כל push לריפו משתקף ב-Base44 Builder. יש לוודא שהקוד תקין לפני push.
- **משתני סביבה** — נדרשים `VITE_BASE44_APP_ID` ו-`VITE_BASE44_APP_BASE_URL` בקובץ `.env.local`.
