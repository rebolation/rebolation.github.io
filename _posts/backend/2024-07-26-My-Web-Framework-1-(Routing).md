---
summary: 나만의 파이썬 마이크로 웹 프레임워크
category: backend
tag: [backend]
bigimg: /images/mywebframework.png
desc: 파이썬으로 나만의 마이크로 웹 프레임워크를 만들어보자. 내가 만든 프레임워크라면 사용법도 쉽게 잊어버리지 않을 것이다.
---
![My Micro Web Framework](/images/mywebframework.png)


- [My Web Framework 1부 - 라우팅](/backend/2024/07/26/My-Web-Framework-1-(Routing).html)
- [My Web Framework 2부 - 템플릿 엔진](/backend/2024/08/04/My-Web-Framework-2-(Template).html)
- [My Web Framework 3부 - 데이터베이스 1](/backend/2024/08/11/My-Web-Framework-3-(database1).html)
- [My Web Framework 4부 - 데이터베이스 2](/backend/2024/08/14/My-Web-Framework-4-(database2).html)
- My Web Framework 5부 - 세션과 쿠키
- My Web Framework 6부 - 보안


파이썬으로 나만의 마이크로 웹 프레임워크를 만들어본다! 생각만 해도 재미있을 것 같다. 여러 프레임워크와 라이브러리들의 사용법들을 모두 기억하기는 어렵지만, 내가 만든 프레임워크라면 잘 잊어버리지 않을 수 있다는 점도 매력적이다. 그럼 어디 한 번 시작해볼까?

### WSGI

파이썬으로 나만의 마이크로 웹 프레임워크를 만들기 전에 WSGI(Python Web Server Gateway Interface)와 ASGI(Asynchronous Server Gateway Interface)에 대해 알아보자.

WSGI는 파이썬 웹 애플리케이션과 웹 서버가 통신하기 위한 표준 인터페이스이다. 이는 파이썬 웹 프레임워크를 만들 때 웹 서버의 저수준 기능을 직접 구현할 필요 없이, 기존 웹 서버를 활용할 수 있도록 해준다. WSGI를 따르는 대표적인 제품으로는 gunicorn 웹 서버, django 웹 프레임워크 등이 있다. django로 웹 애플리케이션을 만들고나서 굳이 gunicorn을 nginx에 연결해줬던 이유가 여기에 있다.

WSGI 명세는 [PEP 333](https://peps.python.org/pep-0333/), [PEP 3333](https://peps.python.org/pep-3333/)에 나와 있다.

![WSGI](/images/wsgi.png)

먼저 WSGI를 따르는 간단한 파이썬 웹 애플리케이션을 작성해보자. 미리 약속된 두 개의 파라미터(environ, start_response)를 사용해 응답하면 된다.

```python
# WSGI를 따르는 웹 애플리케이션
def wsgi_application(environ, start_response):
    status = '200 OK'
    headers = [('Content-type', 'text/plain; charset=utf-8')]
    body = [b'Hello World']
    start_response(status, headers)
    return body

# WSGI를 따르는 웹 서버를 구동하고 웹 애플리케이션을 연결
from wsgiref.simple_server import make_server
app = wsgi_application
wsgi_server = make_server('', 3000, app=app)
wsgi_server.serve_forever()
```

실행한 뒤 localhost:3000에 접속해보면, 브라우저에 Hello World가 출력된다. 무슨 일이 일어난걸까?

wsgi_server는 브라우저로부터 요청을 받으면 WSGI 약속에 따라 (app 인자로 받은) wsgi_application을 호출하며, 이 때 environ이라는 딕셔너리와 start_response라는 콜백 함수를 인자로 전달해준다.

호출된 wsgi_application은 인자를 건네 받아 요청을 처리(environ으로부터 받은 정보를 활용)하고, 응답을 생성(start_response 콜백 함수와 return문을 활용)하여 wsgi_server로 반환한다. 응답은 상태코드, 응답헤더, 응답본문으로 이루어지며 이는 각각 status, headers, body에 해당한다.

![WSGI](/images/wsgi2.png)

wsgi_application 함수 대신 \__call__ 메소드를 구현한 클래스의 인스턴스를 사용해도 된다. wsgi_server가 요청을 받을 때 함수를 호출하는 대신 클래스 인스턴스를 호출한다는 차이가 있을 뿐이다.

```python
# WSGI를 따르는 웹 애플리케이션(클래스 버전)
class WSGIApplication:
    def __call__(self, environ, start_response):
        status = '200 OK'
        headers = [('Content-type', 'text/plain; charset=utf-8')]
        body = [b'Hello World']
        start_response(status, headers)
        return body

app = WSGIApplication()
```

WSGI의 약속에 따라 wsgi_server와 wsgi_application이 의사소통하면서 HTTP 요청과 응답을 처리하는 것을 확인해보았다.

### ASGI

WSGI는 2003년에 도입되어 동기 방식으로 동작한다. 현대적인 웹의 요구에 따라, WSGI와 호환성을 유지하면서 (웹 소켓 같은) 비동기 방식도 지원하기 위해 ASGI(Asynchronous Server Gateway Interface)가 등장했다. WSGI와 달리 scope(environ), send, receive 라는 3개의 매개변수를 사용하며, 특히 send와 receive는 async 함수로 정의하고 있다. fastAPI, quart, django(3.0+) 등의 웹 프레임워크들이 ASGI를 지원한다.


### 웹 프레임워크의 요건

 이제, 본격적으로 나만의 마이크로 웹 프레임워크를 만들어보자! 나만의 마이크로 웹 프레임워크는 어떠한 기능을 구현해야 할까? AI에게 웹 프레임워크가 무엇이냐고 물어보니 웹 애플리케이션을 구축하고 관리하기 위한 도구들(라우팅, 템플릿, 데이터베이스 지원, 보안 등)의 집합이라고 한다. 이걸 전부 언제 다 하나 걱정이 들지도 모르지만, 간단하게만 해볼 것이므로 너무 걱정하지 말자. 우선 라우팅부터 해보자.


### 라우팅

요청과 응답 객체, 라우팅 등을 제공하는 werkzeug라는 WSGI 웹 애플리케이션 라이브러리가 있다. 이를 활용한 웹 프레임워크 중에는 유명한 flask도 있다.

웹 프레임워크에서 라우팅이란 한 마디로 요청 URL의 내용에 따라 이를 처리할 함수나 템플릿 등을 지정해주는 것이라고 할 수 있다. WSGI에서는 environ의 PATH_INFO 값에 요청 URL이 담겨있다. 이를 확인하여 적절한 응답을 생성하면 된다.

라우팅에 관한 코드는 다른 블로그([[1](https://2022.training.plone.org/advanced-python/background.html)],[[2](https://rahmonov.me/posts/write-python-framework-part-one/)])들을 참고하였으며, 내 자신이 새롭게 추가한 부분은 동적 라우팅에서 req.params에 데이터를 추가하고 사용할 수 있도록 한 것 정도이다(express 스타일).

#### 기본 라우팅

우선, 간단한 if 문을 사용해 요청을 라우팅해보자. 요청 주소에 따라 if 문에서 분기되어 응답 본문이 달라지는 것을 볼 수 있다.


```python
import threading, requests # 응답을 확인하기 위해 threading과 requests 모듈 사용

# WSGI 웹 애플리케이션
class MyFramework:
    def __call__(self, environ, start_response):
        path = environ['PATH_INFO']
        if path == '/':
            body = [b'Welcome to D.D.square']
        else:
            body = [path.encode('utf-8')]

        status = '200 OK'
        headers = [('Content-type', 'text/plain; charset=utf-8')]
        start_response(status, headers)
        return body


# WSGI 웹 서버를 구동(새로운 스레드)
from wsgiref.simple_server import make_server
wsgi_server = make_server('', 3000, app=MyFramework())
threading.Thread(target=wsgi_server.serve_forever).start()


# 테스트: 요청 및 응답 확인(메인 스레드)
def get(url):
    print(requests.get(url).text)

get("http://localhost:3000/") # Welcome to D.D.square
get("http://localhost:3000/designer") # /designer
get("http://localhost:3000/developer") # /developer
```

#### Flask 스타일

이번에는 if 문 대신, Flask 웹 프레임워크에서 볼 수 있는 데코레이터 방식을 적용해보자.

요청과 핸들러를 매핑할 라우팅 딕셔너리(routes)를 추가하고, 웹 프레임워크 사용자가 요청 핸들러(index1~3)에 붙일 데코레이터(get, post)를 추가한다. 이제 요청이 들어오면(\__call__), method와 path를 라우팅 딕셔너리 키로 사용해 사용자 핸들러 함수가 호출된다.

```python
class MyFramework:
    def __init__(self):
        self.routes = {'GET':{}, 'POST':{}, 'PATCH':{}, 'DELETE':{}} # 라우팅 딕셔너리

    def __call__(self, environ, start_response):
        path = environ['PATH_INFO']
        method = environ['REQUEST_METHOD']
        self.routes[method][path]("req", "res")

        status = '200 OK'
        headers = [('Content-type', 'text/plain; charset=utf-8')]
        body = [b'Welcome to D.D.square']
        start_response(status, headers)
        return body

    def get(self, path): # 웹 프레임워크 사용자에게 제공할 라우팅 데코레이터
        def deco(f):
            self.routes['GET'][path] = f # 라우팅 딕셔너리에 요청 주소와 핸들러를 저장
            return f
        return deco

    def post(self, path):
        def deco(f):
            self.routes['POST'][path] = f
            return f
        return deco

app = MyFramework()


# 인스턴스의 데코레이터를 사용해 요청 핸들러를 등록(웹 프레임워크 사용자)
@app.get("/")
def index1(req, res):
    print("GET INDEX", req, res)

@app.get("/backend")
def index2(req, res):
    print("GET BACKEND", req, res)

@app.post("/backend")
def index3(req, res):
    print("POST BACKEND", req, res)
```

사용자가 데코레이터를 핸들러에 붙일 때마다 app.get("/")처럼 메소드가 호출되면서 라우팅 딕셔너리에 요청과 핸들러 함수를 등록하는 코드가 한 번씩 실행된다. 핸들러 함수에 따로 기능을 추가하는 것은 아니므로 데코레이터에 래퍼 함수는 없어도 된다.

#### Django 스타일

데코레이터를 사용해 라우팅 딕셔너리를 채워나가는 대신 라우팅 리스트(urlpatterns)를 직접 작성하여 주소와 핸들러를 매핑할 수 있겠다.

#### 요청과 응답 처리

핸들러에서 environ과 start_response를 직접 사용하는 대신, 이들을 Request와 Response 객체로 래핑해주는 WebOb 패키지를 사용하면 편리하다.

```python
from webob import Request, Response

class MyFramework:
    ...
    def __call__(self, environ, start_response):
        path = environ['PATH_INFO']
        method = environ['REQUEST_METHOD']
        handler = self.routes[method][path]
        response = handler(Request(environ), Response())
        return response(environ, start_response)
    ...
```
```python
@app.get("/")
def index1(req, res):
    res.status_code = 200
    res.content_type = 'text/html'
    res.text = f"Today is {req.params['today']}" # Today is FRIDAY
    return res
```

#### 동적 라우팅(라우트 파라미터)

이 글의 URL과 같이 "/{category}/{year}/{month}/{day}/{subject}" 형태의 패턴을 핸들러에 연결해보자. 딕셔너리에 주소 패턴을 등록하고 이를 실제 요청 주소와 비교한다. 정규 표현식을 직접 작성하여 비교하는 대신, parse 패키지를 사용하면 편리하다. 주소 패턴의 각 파라미터를 req.params에 추가하여 핸들러에서 사용한다.

```python
from parse import parse

class MyFramework:
    ...
    def __call__(self, environ, start_response):
        req = Request(environ)
        res = Response()
        handler, req = self._handler(req)
        response = handler(req, res)
        return response(environ, start_response)

    def _handler(self, req):
        for path_, handler_ in self.routes[req.method].items():
            matched = parse(path_, req.path_info)
            if matched is not None: # URL 패턴 일치
                for k, v in matched.named.items():
                    req.environ['QUERY_STRING'] += f"&{k}={v}" # req.params에 추가
                return handler_, req
    ...
```
```python
@app.get("/{category}")
def index2(req, res):
    res.text = f"CATEGORY: {req.params['category']}" # 라우트 파라미터를 사용한 요청 처리
    return res
```
parse("/{category}", "/backend") 함수를 실행하면 [이름 있는 그룹](https://docs.python.org/ko/3/howto/regex.html#non-capturing-and-named-groups) 문법 (?P\<name\>...)을 사용하는 정규 표현식 객체 re.compile('\\\\A/(?P\<category\>.+?)\\\\Z')를 생성하고 match()로 그룹과 일치하는 문자열(backend)을 찾아서 이를 Result 객체에 담아 반환한다. (parse → Parser.\__init__ → _generate_expression → _handle_field → _to_group_name → parse → evaluate_result → _expand_named_fields → Result.\__init__)

werkzeug 역시 라우팅에서 re 모듈을 (훨씬 복잡하게) 사용하고 있다.

if문을 사용한 응답 분기, 데코레이터를 사용한 핸들러 등록, (간접적으로) 정규 표현식을 사용한 동적 라우팅까지 다루어보았다. 여러 가지 예외를 처리해줘야겠지만, 라우팅은 이 정도로 마무리하기로 한다. 웹 프레임워크의 나머지 부분들을 살펴본 후, 시간이 되면 REST API 같은 기능도 추가할 계획이다.

2부에서는 웹 프레임워크에 템플릿 엔진 기능을 추가한다.



### 참고
- [plone training](https://2022.training.plone.org/advanced-python/background.html)
- [How to write a Python web framework](https://rahmonov.me/posts/write-python-framework-part-one/)
- [Let's Build a Template Language in Python](https://www.dmulholl.com/lets-build/a-template-language.html)

