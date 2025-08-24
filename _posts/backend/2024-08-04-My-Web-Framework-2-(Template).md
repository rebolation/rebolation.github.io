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

### 템플릿 엔진

이번에는 템플릿 기능을 추가해보자. 웹 프레임워크에서 템플릿이란 정적 콘텐츠 안에 동적 콘텐츠를 채우기 위한 플레이스홀더(\{\{username\}\} <- 이런 것)가 혼재해 있는 문서를 말한다. 템플릿 엔진은 템플릿에 데이터를 채우는 기본 기능 외에도, 루프와 조건문 같은 제어와 인클루드 기능을 제공하기도 한다.

파이썬과 함께 사용되는 템플릿 엔진은 jinja와 mako 등이 유명하다. jinja와 mako는 템플릿 구문 분석을 이용한다. 템플릿 구문 분석은 주어진 템플릿 문자열을 토큰 목록을 변환하고(렉싱), 토큰 목록을 노드 트리로 변환한 뒤(파싱), 노드 트리를 최종 출력 문자열로 바꾸는 방식이다. 템플릿 소스(플레이스 홀더 등이 포함된 html 문자열)를 구문 분석하여 동적 콘텐츠를 추가할 수 있다.

이 외에도 stpl(bottle), chevron(mustache) 등 여러 템플릿 엔진들이 존재한다. 이들 대부분 역시 정규 표현식과 구문 분석을 이용하며, 작은 엔진의 경우에는 eval 혹은 exec만 사용하여 간단하게 구현하기도 한다. 일단 공통적으로 활용되는 개념들을 살펴보자.


#### exec
exec 내장함수는 동적으로 object(문자열 또는 code 객체)를 실행하고, globals와 locals에서 지정한 네임 스페이스에 변수를 추가한다. 예를 들어 exec("a = 1", None, locals())는 로컬 네임 스페이스(locals()로 넘겨준 딕셔너리)에 값 1을 갖는 지역 변수 a를 추가한다(기존에 a라는 변수가 없을 경우).

```python
exec(object, globals=None, locals=None, /, *, closure=None)
```

템플릿 엔진에 응용할 경우, html 문자열을 한 줄씩 읽어나가면서 이에 대응하는 결과 출력 함수 몸체를 문자열 형태로 한 단계씩 만들어나가고 마지막 단계에서 출력 함수 문자열을 exec으로 실행해 결과를 출력하는 방법 등이 있다.

#### compile

compile 내장함수는 source를 code 객체 (또는 추상구문트리 객체)로 컴파일한다. 반환된 객체는 eval이나 exec 등으로 실행할 수 있다. 바이트코드로 미리 컴파일해두기 때문에 같은 코드를 여러 번 실행해야 할 경우 속도에서 이점이 있는 것 같다. 예를 들어 compile(source="'Hello World'", filename='<string>', mode='eval')는 bytes 타입의 co_code 속성 등을 가지는 code 타입의 객체를 반환한다.

```python
compile(source, filename, mode, flags=0, dont_inherit=False, optimize=-1)
```

jinja와 mako도 내부적으로 exec과 compile을 사용하고 있다. 노드나 템플릿 문자열을 바이트코드로 컴파일하여 속도 향상을 꾀하는 것 같다.

#### 정규 표현식

정규 표현식은 라우팅에서도 유용하게 사용되지만, 템플릿의 플레이스홀더 등을 처리하는 데에도 사용할 수 있다. 문자열의 몇 번째 인덱스가 플레이스 홀더인지 찾아내어 실제 값으로 바꿔준다거나, 구문 분석에 필요한 토큰 분할 지점으로 사용할 수 있을 것이다.

파이썬에서는 정규 표현식을 사용하기 위해 re 모듈을 사용한다. match, search, findall, finditer 같은 함수를 사용해 주어진 문자열이 정규 표현식과 일치하는지 등을 알 수 있다. re.compile은 정규 표현식을 패턴 객체 바이트코드로 컴파일하며, compile 내장함수와 마찬가지로 같은 패턴을 여러 번 비교해야 할 경우 유리하다.

jinja와 mako도 내부적으로 re 모듈을 사용하고 있다. 렉싱 과정에서 정규 표현식을 사용해 토큰을 찾아내고 있다.

#### 구문 분석
jinja와 mako는 구문 분석을 사용하고 있다. 파이썬 템플릿 뿐만 아니라, vue.js 같은 클라이언트측 라이브러리에서도 템플릿을 html로 변환하기 위해 활용하는 기법이다. 또한, 컴파일러의 컴파일 과정, 브라우저의 DOM 트리 생성 과정 등에서도 구문 분석이 이루어진다.

구문 분석(파싱)이란 어떤 입력이 미리 설정한 규칙(문법)을 잘 따르고 있는지 확인하고 이를 트리 형태로 구조화하는 과정이다. 여기서 구문 분석기(파서)의 입력으로 주어지는 것은 분석 대상으로서 의미가 있는 가장 작은 단위(토큰)인데, 이 토큰들은 소스를 어휘 분석(렉싱)하여 얻을 수 있다.

lark라는 파이썬 파싱 라이브러리를 사용해 간단하게나마 파싱을 체험해보자. 먼저 입력(html)을 준비하고, 문법(syntax)을 정의한다. parse 메소드를 실행하면 구문 분석이 이루어지는데, 입력이 문법에 맞으면 토큰들로 이루어진 Tree 객체를 반환하고, 문법에 맞지 않으면 예외가 발생한다.

```python
html = "{# if True #}<ul>{# for item in basket #}<li>{= item =}</li>{# endfor #}</ul>{# endif #}"
syntax = '''
    start: [(instruction_pair|printvar|text)*]
    instruction_pair: instruction_start [(instruction_pair|printvar|text)*] instruction_end
    instruction_start: /{#\s*[(if)|(for)][^{]+\s*#}/
    instruction_end: /{#\s*end[^{]+\s*#}/
    printvar: /{=\s*[^{]+\s*=}/
    text: /[^{]+/
'''
from lark import Lark
l = Lark(syntax)
result = l.parse(html)
```
출력 결과는 다음과 같다. 입력 문자열이 토큰으로 분할되고, 최종적으로 구문 트리 형태로 변환되는 것을 알 수 있다.
```python
Tree(Token('RULE', 'start'), [
    Tree(Token('RULE', 'instruction_pair'), [
        Tree(Token('RULE', 'instruction_start'), [Token('__ANON_0', '{# if True #}')]),
        Tree(Token('RULE', 'text'), [Token('__ANON_3', '<ul>')]),
        Tree(Token('RULE', 'instruction_pair'), [
            Tree(Token('RULE', 'instruction_start'), [Token('__ANON_0', '{# for item in basket #}')]),
            Tree(Token('RULE', 'text'), [Token('__ANON_3', '<li>')]),
            Tree(Token('RULE', 'printvar'), [Token('__ANON_2', '{= item =}')]),
            Tree(Token('RULE', 'text'), [Token('__ANON_3', '</li>')]),
            Tree(Token('RULE', 'instruction_end'), [Token('__ANON_1', '{# endfor #}')])
        ]),
        Tree(Token('RULE', 'text'), [Token('__ANON_3', '</ul>')]),
        Tree(Token('RULE', 'instruction_end'), [Token('__ANON_1', '{# endif #}')])
    ])
])
```
가볍게 파싱을 체험해 보았다. 이제 템플릿 엔진을 코딩할 시간이다!


### 나만의 템플릿 엔진
[Darren Mulholland](https://www.dmulholl.com/lets-build/a-template-language.html)의 좋은 튜토리얼을 토대로 하여 나만의 마이크로 템플릿 엔진을 만들어 보았다. 렉싱 알고리즘을 완전히 교체하였고, IfNode를 확장하여 elif 기능을 구현하였다. 주석과 테스트 코드를 추가하고, 그 외 자잘한 부분을 수정했다.

나만의 템플릿 엔진 소스 코드와 테스트 코드는 [여기](https://github.com/rebolation/jango)에서 확인 가능하다.

전체적인 구조는 앞에서 설명한 바와 같이, 입력 문자열 → 토큰 목록 → 노드 트리 → 출력 문자열로 변환하는 구조이다. 노드 트리를 출력 문자열로 변환하기 위해 컴포지트 패턴을 사용하며, 각 노드가 적절한 스코프에서 데이터를 찾을 수 있도록 컨텍스트 객체를 사용한다.

컨텍스트는 구문 트리의 노드들을 최종 문자열로 변환할 때 변수를 참조하기 위한 네임 스페이스를 제공해준다. 원래는 변수 참조에 실패했을 때 범위를 확장하여 참조를 시도하는 구조였으나 여기서는 간소화하였다.

```python
# 데이터 변수를 위한 컨텍스트 : PrintNode, ForNode, IfNode의 로컬 네임 스페이스 역할
class Context:
    def __init__(self, data: Dict = None):
        if data:
            self.dicts = [data] # 데이터를 보관할 딕셔너리들을 담는 스택
        else:
            self.dicts = [{}]
    ...
    @property
    def local(self):
        return self.dicts[-1] # 최상단 딕셔너리 가져오기

    def lookup(self, varstring):
        try:
            return self[varstring] # __getitem__
        except:
            try:
                return str(eval(varstring)) # 딕셔너리에 값이 없으면 eval 시도
            except:
                return ""
    ...
```
구문 트리의 각 노드는 타입과 텍스트를 담고 있는 토큰을 하나씩 가지고 있다. if-endif 처럼 짝에 대한 정보와, 대응하는 노드 정보 또한 속성으로 가져올 수 있도록 했다.
```python
# 템플릿 문법 태그를 분할지점으로 하여 템플릿 문자열을 분할한 객체 = 파싱 대상
class Token:
    ...
    @property
    def endword(self):
        pairs = {"if": "endif", "for": "endfor"}
        return pairs[self.keyword] if self.keyword in pairs else None

    @property
    def node_class(self):
        pairs = {"if": IfNode, "elif": IfNode, "else": ElseNode, "for": ForNode}
        return pairs[self.keyword] if self.keyword in pairs else None
```
구문 트리는 Node를 상속하는 TextNode, PrintNode, IfNode, ElseNode, ForNode 등으로 구성된다. Node는 자식 노드를 담기 위한 children 리스트를 가지고 있다. 각 노드는 render 메소드를 가지고 있는데, 루트 노드에서 render를 호출하면 모든 자식 노드의 render가 함께 호출된다. IfNode는 참인 경우 렌더할 노드와 거짓인 경우 렌더할 노드로 나뉘어지는데, 이를 처리하기 위한 메소드가 process_children이다.
```python
# if, elif 토큰에 대응하는 노드
class IfNode(Node):
    regex_if = re.compile(r"^if\s+(.+)$")
    regex_elif = re.compile(r"^elif\s+(.+)$")
    ...
    def process_children(self):
        branch = self.true_branch
        elif_ = False
        for i, child in enumerate(self.children):
            if child.token.type == 'instruction' and child.token.keyword  == "elif":
                # 첫번째 elif를 만나면 새로운 IfNode를 생성하고 if의 false_branch로 설정
                if not elif_:
                    elif_ = True
                    self.false_branch = IfNode(child.token)
                    branch = self.false_branch
                # 두번째 elif부터는 기존 elif의 자식으로 추가
                else:
                    branch.children.append(child)
            elif child.token.type == 'instruction' and child.token.keyword  == "else":
                # elif 다음에 else가 있으면 elif에 추가
                if elif_:
                    branch.children.append(child)
                # elif가 없으면 if의 false_branch로 전환
                else:
                    branch = self.false_branch
            else:
                # 그 외의 경우는 현재 branch의 자식으로 추가
                branch.children.append(child)

        if elif_:
            branch.process_children()

    def render(self, context: Context):
        # 컨텍스트의 딕셔너리 스택 최상단의 데이터를 렌더 함수의 로컬 네임 스페이스에 추가
        for key, value in context.local.items():
            locals()[key] = value

        # 로컬 네임 스페이스를 이용하여 참 거짓을 판정, 최종 결과에 반환할 자식을 결정
        if eval(self.arg_string):
            return self.true_branch.render(context)
        else:
            return self.false_branch.render(context)
```
렉서의 tokenize 메소드는 모든 템플릿 문법 태그를 검출하여 이를 인덱스 순으로 정렬하고, 해당 인덱스를 기준으로 토큰을 만든다. 이 과정에서 토큰 타입(text, print, instruction)과 텍스트가 결정된다. 태그가 적절하게 짝지어지지 않으면 예외가 발생한다.
```python
# 렉싱 수행 : 템플릿 문자열을 토큰 목록으로 변환
class Lexer:
    ...
    # 템플릿 문자열을 토큰 목록으로 변환
    def tokenize(self):

        # 모든 태그를 순서대로 검출
        tags = self.find_all_tags()

        # 검출된 태그들의 인덱스를 이용하여 템플릿 문자열을 토큰으로 분할
        start, end = 0, 0
        for i, tag in enumerate(tags):

            # 첫번째 태그 : 인덱스가 0보다 크면 앞에 텍스트 존재
            if i == 0 and tag['index'] > 0:
                text = self.tpl[0:tag['index']]
                self.tokens.append(Token("text", text)) # 토큰: text
                start = tag['index']
                continue

            # 시작 태그
            ...
            # 종료 태그
            ...
            # 마지막 태그 : 인덱스가 템플릿 문자열 길이보다 작으면 뒤에 텍스트 존재
            ...

        return self.tokens


    # 템플릿 문자열에서 모든 태그를 순서대로 검출
    def find_all_tags(self):
        tags = []

        # 모든 태그를 순서에 상관없이 찾고 리스트에 추가
        for tag in self.all_tags:
            while True:
                index = self.tpl.find(tag, self.cursor)
                if index != -1:
                    if tag in self.tag_pairs.keys(): # 시작 태그
                        tags.append({"index": index, "tag": tag, "type":self.tag_types[tag], "opening": True, "expecting": self.tag_pairs[tag]})
                    else: # 종료 태그
                        tags.append({"index": index, "tag": tag, "type":self.tag_types[tag], "opening": False,"expecting": None})
                    self.cursor = index + 2
                else:
                    self.cursor = 0
                    break

        # 태그가 템플릿 문자열에 나타난 순서대로 리스트를 정렬
        tags.sort(key=lambda x: x["index"])

        # 태그가 올바른 순서가 아니면 예외 처리
        for i, tag in enumerate(tags):
            # print(i, tag)
            if tag['opening']:
                if len(self.open_close) > 0:
                    raise TemplateError("Template: 연속된 시작 태그")
                self.open_close.append(tag)
                if i+1 == len(tags):
                    raise TemplateError("Template: 종료 태그 없는 시작 태그")
            else:
                if len(self.open_close) == 0:
                    raise TemplateError("Template: 시작 태그 없는 종료 태그", tag)
                if self.open_close[-1]['expecting'] != tag['tag']:
                    raise TemplateError("Template: 시작 태그와 맞지 않는 종료 태그", tag)
                self.open_close.pop()

        return tags
```


파서의 경우 코드에 손댄 부분이 없어 설명만 하고 넘어가겠다. 맨 먼저 Node 하나가 담긴 스택(트리)을 만든다. 렉서로부터 넘겨받은 토큰들을 활용해 토큰 타입에 대응하는 노드를 생성하고 트리의 노드의 children에 추가한다. 노드가 if나 for 노드이면 이후의 노드들은 if나 for의 자식으로 추가하고, endif나 endfor를 만나면 스택에서 노드를 pop 한다. 그러면 최종적으로는 처음의 노드 하나만 남게 되는데, 이 루트 노드의 children에 자식 노드들이 담겨 있는 모습이 트리 형태를 이루게 된다.

사용자가 템플릿 render 메소드를 호출하면, 구문 트리 루트 노드의 render가 호출된다. 이어서 컴포지트 패턴이 적용되어 모든 자식 노드의 render가 함께 호출되는데, 자식 노드에서 렌더링한 문자열을 반환하면 이를 부모 노드에서 취합하여 최종 문자열을 형성하는 형태이다. render 호출 인자로 컨텍스트가 전달되어 노드들은 각각의 네임 스페이스에서 변수에 접근한다.

나만의 웹 프레임워크를 위한 나만의 템플릿 엔진을 어느 정도 만들었다. 이 과정에서 다른 여러 템플릿 엔진들이 어떤 방식을 사용하는지 참고하였고, 그 중에서 구문 분석 방식을 채택하였다. 문자열 토크나이징과 구문 트리 변환에 대해 다루었고, 트리의 중첩 구조에서 변수 이름 충돌을 방지하는 로컬 네임 스페이스를 활용했으며, 마지막으로 컴포지트 패턴을 활용해 구문 트리를 문자열로 렌더링했다.

보완할 부분이 많겠지만, 템플릿 엔진은 일단 이 정도로 마무리하기로 한다. 추후 문자열 대신 html 파일을 입력으로 하는 기능과 인클루드 기능을 추가할 생각이다. 그 전에 웹 프레임워크의 나머지 부분들을 마저 살펴보는 것이 좋겠다.

3부에서는 웹 프레임워크에 데이터베이스 관련 기능을 추가한다.
