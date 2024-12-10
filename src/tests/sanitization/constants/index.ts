const SQL_TESTS = [
  {
    input: "SELECT * FROM users WHERE username = 'admin' --",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "UNION SELECT username, password FROM users",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1; DROP TABLE users;",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "' OR '1'='1",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "admin' --",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "SELECT * FROM users WHERE id = 1 OR 1=1",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "'; INSERT INTO users (username, password) VALUES ('hacker', 'password');",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "UNION ALL SELECT NULL, NULL, NULL, NULL, NULL--",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "admin' AND 1=0 UNION ALL SELECT 'admin', '81dc9bdb52d04dc20036dbd8313ed055'",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1 AND (SELECT COUNT(*) FROM sysobjects) > 0",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1' UNION SELECT null, name FROM sysobjects WHERE xtype = 'U'--",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1'; WAITFOR DELAY '0:0:10'--",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1' AND 1=(SELECT COUNT(*) FROM tabname); --",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1 AND 1=1",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1' AND '1'='1",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1 UNION SELECT @@version",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "' HAVING 1=1--",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1' ORDER BY 1--",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1' GROUP BY columnnames having 1=1--",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "1) UNION SELECT password FROM users--",
    expected: { isDangerous: true, sanitized: "" },
  },
];

const XSS_TESTS = [
  {
    input: "<script>alert('XSS')</script>",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "<svg onload=alert('XSS')>",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "<body onload=alert('XSS')>",
    expected: { isDangerous: true, sanitized: "<body ='XSS')>" },
  },
  {
    input: "<iframe src='javascript:alert(`XSS`)'></iframe>",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "<a href='javascript:alert(`XSS`)'>Click me</a>",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "<div style='background:url(javascript:alert(`XSS`))'></div>",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input:
      "<object data='data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4='></object>",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "<svg><animate onbegin='alert(1)' attributeName='x'></animate></svg>",
    expected: {
      isDangerous: true,
      sanitized: "<svg><animate onbegin='1)' attributeName='x'></animate></svg>",
    },
  },
  {
    input: "<form action='javascript:alert(`XSS`)'><input type='submit'></form>",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "<math><a xlink:href='javascript:alert(1)'>click</a></math>",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "<script>eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))</script>",
    expected: { isDangerous: true, sanitized: "" },
  },
  {
    input: "<video><source onerror='alert(`XSS`)'>",
    expected: { isDangerous: true, sanitized: "<video><source ='`XSS`)'>" },
  },
  {
    input: "<audio src=x onerror=alert('XSS')>",
    expected: { isDangerous: true, sanitized: "" },
  },
];

const FIELDS_HIDE_TESTS = [
  {
    input: "1234567890",
    start: 2,
    end: 7,
    expected: "12•••••890",
  },
  {
    input: "abcdefghij",
    start: 0,
    end: 5,
    expected: "•••••fghij",
  },
  {
    input: "1234567890",
    start: 5,
    end: 10,
    expected: "12345•••••",
  },
  {
    input: "test@example.com",
    start: 4,
    end: 12,
    expected: "test••••••••.com",
  },
  {
    input: "123-45-6789",
    start: 4,
    end: 6,
    expected: "123-••-6789",
  },
  {
    input: "ABCDEFGHIJ",
    start: 3,
    end: 7,
    expected: "ABC••••HIJ",
  },
  {
    input: "12345",
    start: 1,
    end: 4,
    expected: "1•••5",
  },
  {
    input: "0123456789",
    start: 0,
    end: 10,
    expected: "••••••••••",
  },
  {
    input: "hello world",
    start: 6,
    end: 11,
    expected: "hello •••••",
  },
  {
    input: "0000000000",
    start: 3,
    end: 7,
    expected: "000••••000",
  },
  {
    input: "9876543210",
    start: 2,
    end: 8,
    expected: "98••••••10",
  },
  {
    input: "abcde12345",
    start: 5,
    end: 10,
    expected: "abcde•••••",
  },
  {
    input: "ZYXWVUTSRQ",
    start: 0,
    end: 5,
    expected: "•••••UTSRQ",
  },
  {
    input: "123-456-7890",
    start: 4,
    end: 7,
    expected: "123-•••-7890",
  },
  {
    input: "11112222333",
    start: 4,
    end: 8,
    expected: "1111••••333",
  },
  {
    input: "AABBCCDDEE",
    start: 2,
    end: 8,
    expected: "AA••••••EE",
  },
  {
    input: "1a2b3c4d5e",
    start: 1,
    end: 9,
    expected: "1••••••••e",
  },
  {
    input: "0x1234567890",
    start: 2,
    end: 10,
    expected: "0x••••••••90",
  },
  {
    input: "test-user-name",
    start: 5,
    end: 9,
    expected: "test-••••-name",
  },
  {
    input: "987-654321",
    start: 4,
    end: 9,
    expected: "987-•••••1",
  },
];

export { SQL_TESTS, XSS_TESTS, FIELDS_HIDE_TESTS };
