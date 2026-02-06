"""
Test script to verify enhanced features are working

Run this after server starts to test the new endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test basic server health"""
    response = requests.get(f"{BASE_URL}/api/v1/health")
    print(f"✅ Health Check: {response.status_code}")
    return response.status_code == 200

def test_docs():
    """Test if Swagger docs are accessible"""
    response = requests.get(f"{BASE_URL}/docs")
    print(f"✅ Swagger Docs: {response.status_code}")
    return response.status_code == 200

def test_enhanced_routes_exist():
    """Test if enhanced routes are registered"""
    response = requests.get(f"{BASE_URL}/openapi.json")
    if response.status_code == 200:
        openapi = response.json()
        paths = openapi.get("paths", {})
        
        enhanced_endpoints = [
            "/api/v1/student/dashboard/metrics",
            "/api/v1/teacher/analytics",
            "/api/v1/chatbot/query-enhanced"
        ]
        
        found = []
        for endpoint in enhanced_endpoints:
            if endpoint in paths:
                found.append(endpoint)
                print(f"✅ Found: {endpoint}")
            else:
                print(f"❌ Missing: {endpoint}")
        
        return len(found) == len(enhanced_endpoints)
    return False

if __name__ == "__main__":
    print("🧪 Testing Enhanced Features Implementation\n")
    
    print("1. Testing Server Health...")
    health_ok = test_health()
    
    print("\n2. Testing Swagger Documentation...")
    docs_ok = test_docs()
    
    print("\n3. Testing Enhanced Routes Registration...")
    routes_ok = test_enhanced_routes_exist()
    
    print("\n" + "="*50)
    if health_ok and docs_ok:
        print("✅ SERVER IS RUNNING")
        print(f"📖 View API Docs: {BASE_URL}/docs")
        
        if routes_ok:
            print("✅ ENHANCED FEATURES LOADED")
            print("\nAvailable Enhanced Endpoints:")
            print("  - GET  /api/v1/student/dashboard/metrics")
            print("  - GET  /api/v1/student/jobs/{id}/match-breakdown")
            print("  - POST /api/v1/student/jobs/{id}/apply")
            print("  - GET  /api/v1/teacher/analytics")
            print("  - GET  /api/v1/teacher/jobs/{id}/applicants/ranked")
            print("  - POST /api/v1/chatbot/query-enhanced")
        else:
            print("⚠️  Enhanced features not fully loaded")
            print("   This is normal if you haven't run migrations yet")
            print("   Run: python migrate_enhanced_features.py")
    else:
        print("❌ SERVER NOT RESPONDING")
        print("   Make sure the server is running:")
        print("   uvicorn main:app --reload")
    
    print("="*50)
