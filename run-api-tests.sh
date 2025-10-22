#!/bin/bash

# Docms API Testing Script
# This script performs comprehensive API tests

API_URL="http://localhost:3000"
RESULTS_FILE="api-test-results.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test results array
declare -a TEST_RESULTS

# Function to run test
run_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local auth="$5"
    local expected_status="$6"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -e "\n${YELLOW}Test $TOTAL_TESTS: $test_name${NC}"

    # Build curl command based on whether data is provided
    if [ -z "$data" ]; then
        # No data - don't send Content-Type header
        if [ -z "$auth" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -X $method \
                "$API_URL$endpoint")
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" -X $method \
                -H "Authorization: Bearer $auth" \
                "$API_URL$endpoint")
        fi
    else
        # Has data - send with Content-Type
        if [ -z "$auth" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_URL$endpoint")
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth" \
                -d "$data" \
                "$API_URL$endpoint")
        fi
    fi

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Status: $HTTP_CODE"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("PASS: $test_name")
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} - Expected: $expected_status, Got: $HTTP_CODE"
        echo "Response: $BODY"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("FAIL: $test_name (Expected $expected_status, Got $HTTP_CODE)")
        return 1
    fi
}

echo "========================================="
echo "  Docms API Integration Tests"
echo "  API URL: $API_URL"
echo "========================================="

# Test 1: Check API is running
echo -e "\n${YELLOW}=== Module 1: API Health ===${NC}"
run_test "API Health Check" "GET" "/api" "" "" "200"

# Test 2-6: Authentication Module
echo -e "\n${YELLOW}=== Module 2: Authentication ===${NC}"

run_test "Register ADMIN user" "POST" "/auth/register" \
    '{"email":"admin@test.com","password":"Admin123456","displayName":"Admin User","role":"ADMIN"}' \
    "" "201"

ADMIN_TOKEN=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"Admin123456"}' \
    "$API_URL/auth/login" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

run_test "Register EDITOR user" "POST" "/auth/register" \
    '{"email":"editor@test.com","password":"Editor123456","displayName":"Editor User","role":"EDITOR"}' \
    "" "201"

EDITOR_TOKEN=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"editor@test.com","password":"Editor123456"}' \
    "$API_URL/auth/login" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

run_test "Register AUTHOR user" "POST" "/auth/register" \
    '{"email":"author@test.com","password":"Author123456","displayName":"Author User","role":"AUTHOR"}' \
    "" "201"

AUTHOR_TOKEN=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"author@test.com","password":"Author123456"}' \
    "$API_URL/auth/login" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

run_test "Login with correct credentials" "POST" "/auth/login" \
    '{"email":"admin@test.com","password":"Admin123456"}' \
    "" "200"

run_test "Login with wrong password" "POST" "/auth/login" \
    '{"email":"admin@test.com","password":"WrongPassword"}' \
    "" "401"

run_test "Get user profile" "GET" "/auth/profile" "" "$ADMIN_TOKEN" "200"

# Test 7-12: Category Module
echo -e "\n${YELLOW}=== Module 3: Category Management ===${NC}"

run_test "Create category" "POST" "/categories" \
    '{"name":"技术教程","slug":"tech-tutorials","order":1}' \
    "$ADMIN_TOKEN" "201"

CATEGORY_ID=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"name":"测试分类","slug":"test-category","order":2}' \
    "$API_URL/categories" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

run_test "Get all categories" "GET" "/categories" "" "" "200"

run_test "Get category tree" "GET" "/categories/tree" "" "" "200"

run_test "Reject duplicate slug" "POST" "/categories" \
    '{"name":"另一个分类","slug":"tech-tutorials"}' \
    "$ADMIN_TOKEN" "400"

run_test "VIEWER forbidden to create category" "POST" "/categories" \
    '{"name":"禁止的分类","slug":"forbidden"}' \
    "" "401"

# Test 13-17: Tag Module
echo -e "\n${YELLOW}=== Module 4: Tag Management ===${NC}"

run_test "Create tag" "POST" "/tags" \
    '{"name":"水培技术","slug":"hydroponics"}' \
    "$EDITOR_TOKEN" "201"

TAG_ID=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $EDITOR_TOKEN" \
    -d '{"name":"测试标签","slug":"test-tag"}' \
    "$API_URL/tags" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

run_test "Get all tags" "GET" "/tags" "" "" "200"

run_test "Search tags" "GET" "/tags?search=%E6%B0%B4%E5%9F%B9" "" "" "200"

run_test "Reject duplicate tag slug" "POST" "/tags" \
    '{"name":"另一个标签","slug":"hydroponics"}' \
    "$EDITOR_TOKEN" "400"

# Test 18-25: Post Module
echo -e "\n${YELLOW}=== Module 5: Post Management ===${NC}"

run_test "AUTHOR creates post" "POST" "/posts" \
    "{\"title\":\"水培技术入门\",\"slug\":\"hydro-guide\",\"summary\":\"基础知识\",\"content\":{\"type\":\"html\",\"data\":\"<p>内容</p>\"},\"status\":\"DRAFT\",\"categoryIds\":[\"$CATEGORY_ID\"],\"tagIds\":[\"$TAG_ID\"]}" \
    "$AUTHOR_TOKEN" "201"

POST_ID=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTHOR_TOKEN" \
    -d "{\"title\":\"测试文章\",\"slug\":\"test-post\",\"content\":{\"type\":\"html\",\"data\":\"<p>测试</p>\"},\"categoryIds\":[\"$CATEGORY_ID\"]}" \
    "$API_URL/posts" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

run_test "Get all posts" "GET" "/posts" "" "" "200"

run_test "Search posts" "GET" "/posts?search=%E6%B0%B4%E5%9F%B9" "" "" "200"

run_test "AUTHOR updates own post" "PATCH" "/posts/$POST_ID" \
    '{"title":"更新后的标题"}' \
    "$AUTHOR_TOKEN" "200"

run_test "AUTHOR publishes post (should fail)" "POST" "/posts/$POST_ID/publish" \
    "" "$AUTHOR_TOKEN" "403"

run_test "ADMIN publishes post" "POST" "/posts/$POST_ID/publish" \
    "" "$ADMIN_TOKEN" "201"

# Test 26-32: Product Module
echo -e "\n${YELLOW}=== Module 6: Product Management ===${NC}"

run_test "EDITOR creates product" "POST" "/products" \
    "{\"name\":\"智能水培系统\",\"slug\":\"smart-hydro\",\"summary\":\"专业系统\",\"specs\":{\"size\":\"120cm\"},\"price\":2999,\"categoryId\":\"$CATEGORY_ID\",\"tagIds\":[\"$TAG_ID\"]}" \
    "$EDITOR_TOKEN" "201"

PRODUCT_ID=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $EDITOR_TOKEN" \
    -d "{\"name\":\"测试产品\",\"slug\":\"test-product\",\"price\":1000,\"categoryId\":\"$CATEGORY_ID\"}" \
    "$API_URL/products" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

run_test "Get all products" "GET" "/products" "" "" "200"

run_test "Filter by price range" "GET" "/products?minPrice=2000&maxPrice=3000" "" "" "200"

run_test "AUTHOR creates product (should fail)" "POST" "/products" \
    '{"name":"禁止的产品","slug":"forbidden-product"}' \
    "$AUTHOR_TOKEN" "403"

run_test "EDITOR toggles active (should fail)" "POST" "/products/$PRODUCT_ID/toggle-active" \
    "" "$EDITOR_TOKEN" "403"

run_test "ADMIN toggles active" "POST" "/products/$PRODUCT_ID/toggle-active" \
    "" "$ADMIN_TOKEN" "201"

# Test 33-36: Permissions Module
echo -e "\n${YELLOW}=== Module 7: Permissions ===${NC}"

run_test "Get all permissions" "GET" "/permissions" "" "$ADMIN_TOKEN" "200"

run_test "Get permission hierarchy" "GET" "/permissions/hierarchy" "" "$ADMIN_TOKEN" "200"

run_test "Check role permissions" "GET" "/permissions/check/ADMIN" "" "$ADMIN_TOKEN" "200"

# Test 37-40: Blocks Module
echo -e "\n${YELLOW}=== Module 8: Blocks System ===${NC}"

run_test "Get all block types" "GET" "/blocks/types" "" "$ADMIN_TOKEN" "200"

run_test "Get block type details" "GET" "/blocks/types/HERO" "" "$ADMIN_TOKEN" "200"

run_test "Validate valid block" "POST" "/blocks/validate" \
    '{"type":"Hero","props":{"title":"欢迎","subtitle":"描述"}}' \
    "$ADMIN_TOKEN" "200"

run_test "Get block categories" "GET" "/blocks/categories" "" "$ADMIN_TOKEN" "200"

# Print Summary
echo ""
echo "========================================="
echo "  Test Summary"
echo "========================================="
echo -e "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "${RED}Failed:       $FAILED_TESTS${NC}"
echo -e "Success Rate: $(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)%"
echo "========================================="

# Save results to file
echo "{\"total\":$TOTAL_TESTS,\"passed\":$PASSED_TESTS,\"failed\":$FAILED_TESTS,\"results\":[" > $RESULTS_FILE
for i in "${!TEST_RESULTS[@]}"; do
    echo "  \"${TEST_RESULTS[$i]}\"$([ $i -lt $((${#TEST_RESULTS[@]} - 1)) ] && echo ",")" >> $RESULTS_FILE
done
echo "]}" >> $RESULTS_FILE

echo ""
echo "Results saved to: $RESULTS_FILE"

# Exit with appropriate code
if [ $FAILED_TESTS -eq 0 ]; then
    exit 0
else
    exit 1
fi
