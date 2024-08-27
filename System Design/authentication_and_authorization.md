

# Authentication and Authorization

## Authentication
### Basics of Authentication
- **Overview:** Authentication is the process of verifying the identity of a user or system. It is the first line of defense in securing backend systems.
- **Type of Authentication**
  - Basic Authentication
  - Token-Based Authentication
  - OAuth 2.0
  - OpenID Connect
### Basic Authentication
- **Basic Authentication** involves sending a username and password encoded in base64 with every HTTP request. 
- It's the simplest form of authentication but also the least secure.
- **How Basic Authentication Works**
  - **Request Flow**
    - **Client Request:** The client makes an initial request to the server for a protected resource.
    - **401 Unauthorized Response:** If the resource requires authentication, the server responds with a `401 Unauthorized` status code and includes a `WWW-Authenticate` header in the response.
    - **Client Sends Credentials:** The client then resends the request, this time including an `Authorization` header with the credentials in the form of `Authorization: Basic <base64-encoded-credentials>`.
    - **Server Validation:** The server decodes the credentials from Base64, verifies them against a user database or authentication service, and grants or denies access based on the result.
  - **Base64 Encoding:**
    - Base64 is a binary-to-text encoding scheme that converts binary data into a text string. In Basic Authentication, the username and password are combined into a single string in the format `username:password`, then encoded in Base64.
    - **Example:** For a username "admin" and password "1234", the string "admin:1234" is encoded as "YWRtaW46MTIzNA==". The Authorization header would then be: `Authorization: Basic YWRtaW46MTIzNA==`.
- **Security Concerns**
  - **Lack of Encryption**
    - **Credentials are Exposed:** Since Basic Authentication simply encodes the credentials in Base64, they are not encrypted and can be easily decoded if intercepted.
    - **Man-in-the-Middle Attacks:** If Basic Authentication is used over an unencrypted HTTP connection, credentials can be intercepted by attackers through man-in-the-middle (MITM) attacks.
  - **Reusing Credentials**
    - **Repetition in Every Request:** The same credentials are sent with every request, increasing the risk of exposure. If an attacker intercepts one request, they can gain full access to the account.
  - **Weak Passwords**
    - **Vulnerability to Brute Force:** Basic Authentication does not inherently protect against brute force attacks, where an attacker systematically tries different username-password combinations until they find the correct one.
- **Mitigating Security Risks in Basic Authentication**
  - **Use HTTPS**: Always use HTTPS to encrypt the entire HTTP request, including the Authorization header.
  - **Complexity Requirements for Strong Password**: Enforce policies requiring complex passwords (e.g., a mix of uppercase, lowercase, numbers, and special characters) to make it harder for attackers to guess passwords.
  - **Rate Limiting:** Implement rate limiting to reduce the effectiveness of brute force attacks. After a certain number of failed login attempts, temporarily block the IP address or require a CAPTCHA.
  - **Additional Authentication Layers:** Combine Basic Authentication with additional authentication mechanisms, such as Multi-Factor Authentication (MFA), to add layers of security.
### Token-Based Authentication
- **Token-based authentication** is more secure and scalable. The server issues a token (usually a JSON Web Token or JWT) after successful login, which the client includes in subsequent requests, eliminating the need to send credentials with each request.
- This method is stateless and scalable, making it a popular choice for modern web applications and APIs.
- **How Token-Based Authentication Works**
  - **Login and Token Issuance**
    - **Client Login:** The user provides their credentials (username and password) to the authentication server.
    - **Server Validation:** The server validates the credentials against a user database.
    - **Token Generation:** Upon successful validation, the server generates a token, typically a JSON Web Token (JWT), and sends it back to the client.
    - **Client Stores the Token:** The client stores the token securely, often in local storage or an HTTP-only cookie.
  - **Subsequent Requests**
    - **Client Sends Token:** For subsequent requests, the client includes the token in the Authorization header (`Authorization: Bearer <token>`).
    - **Server Verifies Token:** The server verifies the token’s authenticity and validity.
    - **Access Granted:** If the token is valid, the server processes the request and returns the appropriate response.
- **Types of Tokens**
  - **JSON Web Token (JWT)**: are self-contained tokens that can carry user information (claims) in a secure, compact, and URL-safe manner.
    - They are signed using a secret or public/private key pair, which ensures that the data has not been altered.
    - **Strengths**
      - **Stateless:** No need for the server to store session information.
      - **Scalable:** Easily distributed across multiple servers.
      - **Versatile:** Can include custom claims to carry additional information.
    - **Weaknesses:**
      - **Size:** JWTs can be large if they contain many claims, potentially affecting performance.
      - **Revocation:** Once issued, JWTs cannot be easily revoked unless a blacklist is maintained.
  - **Opaque Tokens:** These tokens do not carry any information about the user; they are simply a reference that the server can use to look up session information.
    - Commonly used in OAuth 2.0, where the token is a reference to session data stored on the server, typically used for access tokens.
    - **Strengths**
      - **Secure:** Since they don’t carry any user information, they are less vulnerable to tampering.
      - **Easy Revocation:** Tokens can be easily revoked by invalidating the session on the server.
    - **Weaknesses**
      - **Stateful:** The server must maintain session state, which can limit scalability.
      - **Less Versatile:** Cannot carry claims or additional information like JWTs.
  - **Refresh Tokens:** Refresh tokens are long-lived tokens used to obtain new access tokens without requiring the user to re-authenticate. 
    - They are typically used alongside JWTs to extend the session without compromising security.
    - Typically used in scenarios where access tokens are short-lived, refresh tokens are used to issue new access tokens once the original expires, without requiring user interaction.
    - **Strengths**
      - **Improved Security:** Short-lived access tokens reduce the risk of token misuse.
      - **User Experience:** Allows for seamless session renewal without frequent logins.
    - **Weaknesses**
      - **Security Risks:** If a refresh token is compromised, it could lead to extended unauthorized access.
      - **Storage:** Secure storage of refresh tokens is crucial to prevent unauthorized access.
  - **API Keys:** are tokens used to authenticate requests made to an API.
    - They are often used to identify and authenticate a user or application making requests to an API.
    - Commonly used in public APIs to monitor and control usage. Each user or application is issued a unique API key.
    - **Strengths**
      - **Simple:** Easy to implement and use for basic authentication.
      - **Control:** Can be used to monitor usage, enforce rate limits, and identify users.
    - **Weaknesses**
      - **Security:** API keys can be easily compromised if not handled securely.
      - **No Identity Information:** API keys don’t carry user information, so additional steps are needed to identify the user.
- **JWT Structure**
  - JWTs are composed of three parts: Header, Payload, and Signature.
  - These parts are separated by dots (.), resulting in a compact string that looks like this: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`.
  - Each part is Base64Url encoded and can be easily decoded for inspection.
  - Parts of JWT
    - **Header**  typically consists of two fields:
      - `alg`: The signing algorithm used, such as HMAC SHA256 or RSA.
      - `typ`: The type of token, which is usually “JWT”.
      - Example: `{"alg": "HS256", "typ": "JWT"}`
    - **Payload** Contains the claims, which are statements about an entity (typically the user) and additional data.
      - Claims can be categorized into three types:
        - **Registered Claims:** Predefined claims that are not mandatory but are recommended for usage. These include:
          - **`iss` (Issuer):** Identifies the issuer of the JWT (e.g., your authentication server).
          - **`sub` (Subject):** Identifies the principal (subject) of the JWT (e.g., user ID).
          - **`aud` (Audience):** Identifies the recipients the JWT is intended for.
          - **`exp` (Expiration Time):** Defines the expiration time of the token. After this time, the token is considered invalid.
          - **`nbf` (Not Before):** Specifies the time before which the token must not be accepted.
          - **`iat` (Issued At):** The time at which the token was issued, used to determine its age.
          - **`jti` (JWT ID):** A unique identifier for the token, useful for preventing replay attacks.
        - **Public Claims:** Custom claims created by the application to convey information about the user or the session. These should be defined in a way that prevents collision with other claims. Example:
          - **role:** Specifies the role of the user (e.g., admin, user).
          - **permissions:** Lists the permissions granted to the user.
          - **Example Payload:**
            ```json
            {
              "sub": "1234567890",
              "name": "John Doe",
              "admin": true,
              "exp": 1516239022,
              "role": "admin",
              "permissions": ["read", "write", "delete"]
            }
            ```
        - **Private Claims:** Claims that are agreed upon between parties exchanging the JWT. These are typically used to share information specific to the application.
    - **Signature:** is used to verify the integrity of the token and ensure that the payload has not been tampered with. 
      - It is created by taking the encoded header and payload, concatenating them with a secret key, and hashing the result.
      - Example: `HMACSHA256( base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`
- **Statelessness:** Token-based systems are stateless, meaning the server does not need to maintain a session for each user, reducing server load.
  - This statelessness makes token-based systems more scalable, especially in distributed environments where multiple servers handle requests.
- **Security Considerations**
  - **Token Expiry**
    - **`exp` Claim:** JWTs should include an expiration (`exp`) claim that specifies when the token will expire. This limits the time an attacker can use a compromised token.
    - **Short Lifespan:** Use a short lifespan for access tokens and issue refresh tokens to renew them without requiring re-authentication.
  - **Token Signing**
    - **HMAC (Symmetric):** Uses a shared secret for signing. All parties that validate the token must have the same secret.
    - **RSA or ECDSA (Asymmetric)**: Uses a public/private key pair for signing. The server signs the token with a private key, and clients verify it using the public key.
  - **Storing Tokens**
    - **Local Storage:** Storing JWTs in local storage or session storage is common but exposes them to XSS attacks.
    - **HTTP-Only Cookies:** Storing JWTs in HTTP-only cookies adds an extra layer of security by preventing client-side scripts from accessing them.
  - **Revoking Tokens**
    - **Stateless Nature:** JWTs do not have a built-in revocation mechanism due to their statelessness.
    - **Blacklisting:** Maintain a token blacklist on the server to invalidate specific tokens, though this reduces the scalability benefits of JWTs.
    - **Short-Lived Tokens:** Issue short-lived tokens and use refresh tokens to minimize the impact of token compromise.
- **Setting Up Token-Based Authentication**
  - **Generate and Sign Tokens:** Use libraries like jsonwebtoken in Node.js, pyjwt in Python, or similar in other languages to generate and sign JWTs.
  - **Token Verification:** Implement middleware to verify the token in each incoming request, ensuring it’s valid and not expired.
  - **Error Handling:** Handle cases where tokens are invalid, expired, or missing by returning appropriate HTTP status codes (e.g., 401 Unauthorized).
  - **Flask Example**
    ```python
    from flask import Flask, request, jsonify
    import jwt
    import datetime

    app = Flask(__name__)

    SECRET_KEY = 'your_secret_key'              # Secret key used to encode the JWT, this should be stored securely.
    JWT_ALGO = 'HS256'

    users = { 
        "user1": "password1",
        "user2": "password2"
    }

    @app.route('/login', methods=['POST'])      # Endpoint to authenticate and generate a token
    def login():
        auth_data = request.json
        username = auth_data.get('username')
        password = auth_data.get('password')
        if users.get(username, "") == password: # validate user
            token = jwt.encode({                # Generate a JWT token
                'username': username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
            }, SECRET_KEY, algorithm=JWT_ALGO)
            return jsonify({'token': token})
        return jsonify({'message': 'Invalid credentials'}), 401

    @app.route('/protected', methods=['GET'])   # Endpoint to access a protected resource
    def protected():
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 403
        try:
            token = token.split()[1]            # Remove the "Bearer " prefix and decode the token
            data = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGO])
            return jsonify({'message': f'Welcome, {data["username"]}!'})
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 403

    if __name__ == '__main__':
        app.run(debug=True)
    ```
- **Token Revocation**
  - **Why Token Revocation?**
    - **User Logout:** When a user logs out, their token should be invalidated to prevent unauthorized access.
    - **Token Compromise:** If a token is compromised (e.g., stolen or leaked), it should be revoked immediately to prevent misuse.
    - **Access Revocation:** When a user’s permissions change, or their account is disabled, all active tokens should be invalidated.
  - **Token Revocation Strategies**
    - **Blacklisting (Token Blacklist)**
      - **Blacklisting** involves maintaining a list of tokens that have been revoked. When a token is presented, the server checks the blacklist to see if it has been invalidated.
      - **How It Works:**
        - **Storing Revoked Tokens:** When a token needs to be revoked, its unique identifier (e.g., the jti claim in a JWT) is added to a blacklist.
        - **Checking the Blacklist:** For each request, the server checks if the token’s identifier is in the blacklist. If it is, the token is rejected.
      - **Properties**
        - **Effective for Immediate Revocation:** Allows immediate invalidation of tokens, which is useful for scenarios like user logout or compromised tokens.
        - **Stateful:** Requires maintaining state on the server, which negates some of the benefits of stateless token systems like JWTs.
        - **Scalability Concerns:** Managing a large blacklist can become cumbersome, especially in high-traffic environments or when dealing with a large number of users.
    - **Token Expiry and Short-Lived Tokens**
      - This strategy involves issuing tokens with short lifespans, minimizing the window in which a compromised token can be used.
      - **How It Works**
        - **Short Token Lifespan:** Tokens are issued with a short expiration time (e.g., 15 minutes).
        - **Refresh Tokens:** Alongside the short-lived access token, a longer-lived refresh token is issued. When the access token expires, the client uses the refresh token to obtain a new access token.
      - **Properties**
        - **Minimizes Risk:** Short-lived tokens reduce the time window in which a compromised token can be used.
        - **Simplifies Revocation:** Since tokens expire quickly, there’s less need for explicit revocation mechanisms.
        - **Increased Server Load:** Frequent token renewals may increase the load on the server.
        - **Complexity with Refresh Tokens:** Requires careful management of refresh tokens, which themselves may need to be revoked in case of compromise.
    - **Token Versioning**
      - **Token versioning** involves adding a version identifier to the token, which is incremented when a user’s permissions change or their account is disabled.
      - **How It Works**
        - **Version Field in Token:** Include a version field in the token (e.g., v: 1).
        - **Check Against Current Version:** When processing a request, the server checks if the token’s version matches the current version stored in the user’s record.
        - **Invalidation on Mismatch:** If the versions don’t match, the token is considered invalid.
      - **Properties**
        - **Fine-Grained Control:** Allows for precise control over token invalidation, especially in scenarios where user permissions change frequently.
        - **Requires State Management:** Requires storing the current token version on the server, introducing some statefulness.
        - **Not Immediate:** This method is not useful for immediate revocation, as the token remains valid until the version is updated.
    - **Revoking Refresh Tokens**
      - Since refresh tokens are long-lived, they need a robust revocation mechanism to ensure that a compromised refresh token cannot be used indefinitely.
      - **How It Works**
        - **Unique Identifier for Each Refresh Token:** Assign a unique identifier to each refresh token.
        - **Server-Side Storage:** Store this identifier in a database or cache when issuing the token.
        - **Revoke by Deletion:** When a refresh token is revoked, delete its identifier from the server-side storage.
      - **Properties**
        - **Granular Control:** Allows specific refresh tokens to be revoked without affecting others.
        - **Stateful:** Requires maintaining state on the server, which can complicate scalability.
        - **Security Concerns:** If the refresh token is not properly stored on the client-side, it can be compromised, leading to unauthorized access.






### OAuth 2.0
- **Overview:** OAuth 2.0 is an industry-standard protocol for authorization, allowing third-party services to exchange information securely without exposing user credentials.
- **OAuth 2.0 Grant Types:**
  - **Authorization Code:** The most common and secure method, suitable for web and mobile applications. It involves an authorization code exchange for an access token.
  - **Implicit Grant:** Designed for single-page applications where the access token is issued directly. It's less secure due to the lack of a server-side exchange.
  - **Client Credentials:** Used when an application needs to authenticate itself rather than a user, typically for machine-to-machine communication.
  - **Resource Owner Password Credentials:** Allows users to pass their username and password directly. This method should be avoided as it compromises user credentials.
- **Scopes and Permissions:** Scopes limit what actions an access token can perform. Designing scopes carefully ensures least privilege access.
- **Security Best Practices:**
  - **PKCE (Proof Key for Code Exchange):** Adds an additional layer of security to the Authorization Code flow, mitigating attacks like authorization code interception.
  - **State Parameter:** Prevents CSRF attacks by including a unique value in the authorization request and verifying it in the response.
### OpenID Connect
- **Overview:** OpenID Connect (OIDC) is an identity layer on top of OAuth 2.0 that adds authentication to the authorization capabilities of OAuth. It’s widely used for single sign-on (SSO) scenarios.
- ID Tokens: OIDC introduces ID tokens, which contain user identity information and can be used to verify the user’s identity without additional API calls.
- Claims: ID tokens can include various claims about the user, such as name, email, and profile information, customizable based on the application’s needs.

## Authorization
### Basics of Authorization
- **Overview:** Authorization determines what resources a user or system can access after being authenticated. It involves setting up roles, permissions, and access control mechanisms.
### Role-Based Access Control (RBAC)
- **Overview:** RBAC restricts system access to authorized users based on their roles. Roles are defined according to job functions, and each role has specific permissions associated with it.
- **Implementing RBAC:** 
  - **Role Hierarchies:** Create role hierarchies where higher-level roles inherit permissions from lower-level roles.
  - **Role Management:** Design a system for managing roles and permissions dynamically, allowing for role assignment and revocation without redeploying the application.
- **Security Considerations:**
  - **Principle of Least Privilege:** Ensure users have the minimum level of access required to perform their tasks.
  - **Auditing and Logging:** Implement logging mechanisms to track role changes and access to sensitive resources.
### Attribute-Based Access Control (ABAC)
- **Overview:** ABAC is more dynamic than RBAC, allowing access decisions based on attributes (e.g., user attributes, resource attributes, environmental conditions).
- **Policy Language:** Define policies using logical statements that consider attributes. For example, “Allow access if the user is in the HR department and the resource is a payroll file.”
- **Use Cases:** ABAC is particularly useful in complex environments where access control decisions depend on a wide range of factors.
- **Security Considerations:**
  - **Policy Complexity:** ABAC policies can become complex and hard to manage, requiring thorough documentation and testing.
  - **Performance Impact:** Evaluate the performance impact of ABAC, especially in large-scale systems with numerous policies and attributes.
### Context-Aware Access Control
- **Overview:** Context-aware access control adjusts access permissions based on the context, such as time of day, location, device used, etc.
- **Use Cases:** Context-aware control is useful for preventing access in unusual circumstances, such as access attempts from unfamiliar devices or locations.
- **Implementation Strategies:**
  - **Dynamic Policies:** Create policies that adjust access based on real-time context changes.
  - **Multi-Factor Authentication (MFA):** Use MFA for sensitive operations, especially when the context deviates from the usual pattern (e.g., access from a new location).
### Authorization Strategies and Best Practices
- **Segregation of Duties:** Implement controls to prevent any single user from having access to both sensitive information and the ability to alter that information.
- **Fine-Grained Access Control:** Consider the need for fine-grained access control in scenarios where RBAC is insufficient. This involves setting permissions at the resource level rather than at the role level.
- **Auditing and Compliance:** Regularly audit access controls and authorization mechanisms to ensure compliance with internal policies and external regulations.

## API Gateway Integration
- An **API Gateway** acts as a reverse proxy that routes client requests to the appropriate microservices in a backend system.
- It also handles cross-cutting concerns like authentication, rate limiting, logging, and more.
- **Authentication at the Gateway Level**
  - The API Gateway can handle token-based authentication by validating tokens before forwarding requests to backend services.
  - **Token Validation**
    - **JWT Verification:** The gateway verifies the JWT by checking its signature, expiration time, and other claims. This ensures that only valid tokens are allowed through.
    - **Opaque Token Verification:** If using opaque tokens, the gateway queries an authentication server or database to validate the token.
  - **Implementation**
    - **Middleware for Token Validation:** Implement middleware in the gateway to extract and validate the token from the Authorization header.
    - **Pass User Information to Services:** After validation, the gateway can pass relevant user information (e.g., user ID, roles) to the backend services as headers or in the request context.
- **Authorization**
  - The API Gateway can enforce access control by checking the user’s roles and permissions before forwarding the request.
  - **Role-Based Access Control (RBAC):** The gateway checks if the user’s role, as specified in the token, has the necessary permissions to access the requested resource.
  - **Policy-based Authorization:** Define access policies in the gateway configuration to control access based on the claims in the token (e.g., roles, permissions, scope).
- **Flask Example**
  ```python
  from flask import Flask, request, jsonify
  import jwt

  app = Flask(__name__)
  SECRET_KEY = 'your_secret_key'

  users = {                               # Dummy user data
      "admin": {"password": "adminpass", "role": "admin"},
      "user": {"password": "userpass", "role": "user"}
  }

  def generate_token(username, role):     # Function to generate JWT token
      return jwt.encode({'username': username, 'role': role}, SECRET_KEY, algorithm='HS256')

  @app.route('/login', methods=['POST'])  # Login route to authenticate and return a token
  def login():
      data = request.json
      user = users.get(data['username'])
      if user and user['password'] == data['password']:
          token = generate_token(data['username'], user['role'])
          return jsonify({'token': token})
      return jsonify({'message': 'Invalid credentials'}), 401

  def authorize(role):                    # Middleware to authenticate and authorize
      def wrapper(f):
          def decorated_function(*args, **kwargs):
              token = request.headers.get('Authorization')
              if not token:
                  return jsonify({'message': 'Token missing'}), 401
              try:
                  data = jwt.decode(token.split()[1], SECRET_KEY, algorithms=['HS256'])
                  if data['role'] != role:
                      return jsonify({'message': 'Unauthorized'}), 403
              except jwt.InvalidTokenError:
                  return jsonify({'message': 'Invalid token'}), 403
              return f(*args, **kwargs)
          return decorated_function
      return wrapper

  @app.route('/user', methods=['GET'])      # Protected routes
  @authorize('user')
  def user():
      return jsonify({'message': 'Welcome, user!'})

  if __name__ == '__main__':
      app.run(debug=True)

  ```







## read later
- OAuth 2.0 Advanced Use Cases: Explore advanced use cases like token introspection, token revocation, and OAuth 2.0 Mutual-TLS.
- Zero Trust Architecture: Study how Zero Trust principles can be applied to authentication and authorization to enhance security.
- Federated Identity and Single Sign-On (SSO): Delve deeper into SSO mechanisms and federated identity management systems.
- Multi-Factor Authentication (MFA): Investigate various MFA methods and their implementation, including hardware tokens, biometric authentication, and SMS-based MFA.
- Advanced Attribute-Based Access Control (ABAC): Explore the use of ABAC in dynamic and large-scale environments, focusing on policy definition languages and their optimization.
- Security in OAuth 2.0 Implementations: Focus on common pitfalls in OAuth 2.0 implementations and how to avoid them, including best practices for securing access tokens and refresh tokens.
- Implementing HTTPS: Understand how to implement HTTPS in a server environment, including SSL/TLS certificate management.
- Rate Limiting and Throttling: Learn how to implement rate limiting to protect against brute force attacks effectively.
- Token-Based Authentication: Delve deeper into how token-based systems (like JWT) work and their advantages over Basic Authentication.