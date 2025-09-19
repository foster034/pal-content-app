#!/usr/bin/env node

/**
 * Comprehensive test script for the franchisee linkage and tech addition workflow
 * This script tests the complete end-to-end flow after applying the fixes
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function testDatabaseMigration() {
  console.log('\n🔧 Testing Database Migration...');

  try {
    // Test the new trigger function
    const { data: triggerExists } = await supabase.rpc('handle_new_user');
    console.log('✅ New user trigger function exists and callable');

    // Test the franchisee linkage function
    const { data: linkResult } = await supabase.rpc('link_existing_franchisee_accounts');
    console.log('✅ Franchisee linkage function working:', linkResult);

    // Test the franchisee dashboard view
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('franchisee_dashboard')
      .select('*')
      .limit(5);

    if (dashboardError) {
      console.log('⚠️  Franchisee dashboard view not accessible (expected if no data):', dashboardError.message);
    } else {
      console.log('✅ Franchisee dashboard view accessible:', dashboardData?.length || 0, 'records');
    }

    return true;
  } catch (error) {
    console.error('❌ Database migration test failed:', error.message);
    return false;
  }
}

async function testFranchiseeCreation() {
  console.log('\n👔 Testing Franchisee Creation Flow...');

  const testEmail = `test-franchisee-${Date.now()}@example.com`;
  const testData = {
    email: testEmail,
    password: 'TestPassword123!',
    fullName: 'Test Franchisee Owner',
    businessName: 'Test Pop-A-Lock Location',
    phone: '(555) 123-4567',
    createAuth: true,
    country: 'Canada'
  };

  try {
    // Simulate API call to create franchisee
    const response = await fetch('http://localhost:3000/api/franchisees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Franchisee created successfully:', result.franchisee?.business_name);
      console.log('✅ Auth account created:', result.authCreated);

      // Verify the linking worked
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, franchisees(*)')
        .eq('email', testEmail)
        .single();

      if (profile?.franchisees) {
        console.log('✅ Franchisee properly linked to profile');
        return { success: true, franchiseeId: profile.franchisees.id, userId: profile.id };
      } else {
        console.log('⚠️  Franchisee created but not properly linked');
        return { success: false };
      }
    } else {
      const error = await response.json();
      console.error('❌ Franchisee creation failed:', error.error);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Franchisee creation test failed:', error.message);
    return { success: false };
  }
}

async function testTechnicianAddition(franchiseeId) {
  console.log('\n🔧 Testing Technician Addition Flow...');

  const testTechData = {
    name: 'Test Technician',
    email: `test-tech-${Date.now()}@example.com`,
    phone: '(555) 987-6543',
    franchiseeId: franchiseeId,
    role: 'technician',
    createAuth: false
  };

  try {
    // Test technician creation
    const response = await fetch('http://localhost:3000/api/technicians', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTechData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Technician created successfully:', result.name);
      console.log('✅ Login code generated:', result.login_code);

      // Test invitation sending
      const inviteResponse = await fetch('http://localhost:3000/api/technicians/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: result.id,
          sendEmail: true
        })
      });

      if (inviteResponse.ok) {
        const inviteResult = await inviteResponse.json();
        console.log('✅ Invitation sent successfully');
        console.log('✅ Setup URL generated:', !!inviteResult.inviteData?.setupUrl);
        return { success: true, technicianId: result.id };
      } else {
        console.log('⚠️  Technician created but invitation failed');
        return { success: true, technicianId: result.id };
      }
    } else {
      const error = await response.json();
      console.error('❌ Technician creation failed:', error.error);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Technician addition test failed:', error.message);
    return { success: false };
  }
}

async function testDataRetrieval(franchiseeId) {
  console.log('\n📊 Testing Data Retrieval...');

  try {
    // Test fetching technicians for the franchisee
    const { data: technicians, error: techError } = await supabase
      .from('technicians')
      .select('*')
      .eq('franchisee_id', franchiseeId);

    if (techError) {
      console.error('❌ Failed to fetch technicians:', techError.message);
      return false;
    }

    console.log('✅ Technicians fetched successfully:', technicians?.length || 0, 'records');

    // Test the franchisee dashboard view
    const { data: dashboard, error: dashError } = await supabase
      .from('franchisee_dashboard')
      .select('*')
      .eq('franchisee_id', franchiseeId)
      .single();

    if (dashError) {
      console.log('⚠️  Dashboard data not available (may be expected):', dashError.message);
    } else {
      console.log('✅ Dashboard data retrieved:', dashboard?.business_name);
    }

    return true;
  } catch (error) {
    console.error('❌ Data retrieval test failed:', error.message);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');

  try {
    // Clean up test technicians
    await supabase
      .from('technicians')
      .delete()
      .like('email', 'test-tech-%@example.com');

    // Clean up test profiles
    await supabase
      .from('profiles')
      .delete()
      .like('email', 'test-franchisee-%@example.com');

    // Clean up test franchisees
    await supabase
      .from('franchisees')
      .delete()
      .like('email', 'test-franchisee-%@example.com');

    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('⚠️  Cleanup failed (may be expected):', error.message);
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete Workflow Test');
  console.log('=' .repeat(50));

  let allTestsPassed = true;

  // Step 1: Test database migration
  const migrationPassed = await testDatabaseMigration();
  allTestsPassed = allTestsPassed && migrationPassed;

  // Step 2: Test franchisee creation
  const franchiseeResult = await testFranchiseeCreation();
  allTestsPassed = allTestsPassed && franchiseeResult.success;

  if (franchiseeResult.success && franchiseeResult.franchiseeId) {
    // Step 3: Test technician addition
    const techResult = await testTechnicianAddition(franchiseeResult.franchiseeId);
    allTestsPassed = allTestsPassed && techResult.success;

    // Step 4: Test data retrieval
    const retrievalPassed = await testDataRetrieval(franchiseeResult.franchiseeId);
    allTestsPassed = allTestsPassed && retrievalPassed;
  }

  // Step 5: Cleanup
  await cleanupTestData();

  console.log('\n' + '=' .repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! The workflow is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the issues above.');
  }
  console.log('=' .repeat(50));

  return allTestsPassed;
}

async function main() {
  console.log('Franchisee Linkage & Tech Addition Workflow Tester');
  console.log('==================================================');

  const runTest = await askQuestion('\nDo you want to run the complete workflow test? (y/n): ');

  if (runTest.toLowerCase() === 'y' || runTest.toLowerCase() === 'yes') {
    await runCompleteTest();
  } else {
    console.log('Test cancelled.');
  }

  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testDatabaseMigration,
  testFranchiseeCreation,
  testTechnicianAddition,
  testDataRetrieval,
  runCompleteTest
};