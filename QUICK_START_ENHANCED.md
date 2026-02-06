# QUICK START GUIDE - ENHANCED FEATURES

## Step 1: Run Database Migration

```bash
python migrate_enhanced_features.py
```

This will create 6 new tables without affecting existing data.

## Step 2: Restart Server

Stop your current server (Ctrl+C) and restart:

```bash
uvicorn main:app --reload
```

You should see: `✅ Enhanced features loaded successfully`

## Step 3: Test Endpoints

Visit: http://localhost:8000/docs

### Try These First:

1. **Student Dashboard Metrics**
   - Endpoint: `GET /api/v1/student/dashboard/metrics`
   - Auth: Student JWT token
   - Returns: Profile completeness, resume score, missing skills

2. **Apply to Job**
   - Endpoint: `POST /api/v1/student/jobs/{job_id}/apply`
   - Auth: Student JWT token
   - Creates application with match scores

3. **Teacher Analytics**
   - Endpoint: `GET /api/v1/teacher/analytics`
   - Auth: Teacher JWT token
   - Returns: Jobs, applications, skill demand

4. **Ranked Applicants**
   - Endpoint: `GET /api/v1/teacher/jobs/{job_id}/applicants/ranked`
   - Auth: Teacher JWT token
   - Returns: Sorted applicants with explanations

5. **Context-Aware Chatbot**
   - Endpoint: `POST /api/v1/chatbot/query-enhanced`
   - Auth: Student JWT token
   - Body: `{"message": "Why wasn't I recommended for backend roles?"}`

## Step 4: Verify Features

### For Students:
1. Login as student
2. Call `/student/dashboard/metrics` - should return profile data
3. Apply to a job - should calculate match scores
4. Check `/student/applications` - should show status

### For Teachers:
1. Login as teacher
2. Call `/teacher/analytics` - should show metrics
3. View applicants for a job - should see rankings
4. Update application status - should queue email

## Common Issues

### "Enhanced features not yet migrated"
- Run `python migrate_enhanced_features.py`
- Restart server

### "Table already exists"
- Safe to ignore, migration is idempotent

### "ImportError: cannot import name 'student_enhanced'"
- Check that all new files are in `app/routers/` directory
- Verify file names match imports

## File Checklist

Ensure these files exist:

```
app/
├── models/
│   └── enhanced_models.py ✓
├── services/
│   ├── analytics_service.py ✓
│   └── enhanced_chatbot.py ✓
├── routers/
│   ├── student_enhanced.py ✓
│   ├── teacher_enhanced.py ✓
│   └── chatbot_enhanced.py ✓
└── schemas/
    └── enhanced_schemas.py ✓
```

## API Testing Examples

### Get Student Dashboard
```bash
curl -X GET "http://localhost:8000/api/v1/student/dashboard/metrics" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### Apply to Job
```bash
curl -X POST "http://localhost:8000/api/v1/student/jobs/1/apply" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### Get Teacher Analytics
```bash
curl -X GET "http://localhost:8000/api/v1/teacher/analytics" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### Rank Applicants
```bash
curl -X GET "http://localhost:8000/api/v1/teacher/jobs/1/applicants/ranked" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### Context Chatbot
```bash
curl -X POST "http://localhost:8000/api/v1/chatbot/query-enhanced" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What skills should I learn next?"}'
```

## Next Steps

1. Update frontend to call new endpoints
2. Test email notifications (check `email_notifications` table)
3. Review `ENHANCED_FEATURES_GUIDE.md` for full documentation
4. Customize formulas in `analytics_service.py` if needed

## Support

All features are backward compatible. Your existing code continues to work unchanged.

For detailed API documentation, see: `ENHANCED_FEATURES_GUIDE.md`
