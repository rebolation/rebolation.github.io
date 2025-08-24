---
summary: 나만의 파이썬 마이크로 웹 프레임워크
category: backend
tag: [framework, python]
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




### ORM

다음으로 필요한 것은 직관적인 CRUD 인터페이스와 객체-관계 매핑이다. 여기서는 관계형 데이터베이스 지원을 1차 목표로 한다.

ORM(Object-Relational Mapper)은 개발자들에게 많은 인기를 얻고 있는 듯 하다. 그러나 ORM을 반대하는 의견도 많이 보이며, 개인적으로도 ORM의 단점이 크게 느껴진다. 사용법을 따로 공부하고 기억해야 할 뿐더러 쿼리가 조금만 복잡해져도 직관적이지 않은 코드가 되는 경향이 있다. 게다가 확실히 알고 제대로 다루지 못하면 성능 측면에서도 큰 손해가 있을 수 있다고 한다.

JPA 같은 표준 API는 있지만, ORM의 모범 답안이라고 할만한 것은 없는 것 같다. 애플리케이션은 객체 중심으로 돌아가는 반면, 관계형 데이터베이스는 관계 위주로 돌아가며, 이 둘을 매핑하는 것에 대한 어려움은 "객체-관계 임피던스 불일치"라는 단어로 표현되기도 한다.

[Pony ORM](https://github.com/ponyorm/pony/)이라는 파이썬스러운 ORM이 눈에 띈다. 파이썬 문법을 그대로 사용하여 쿼리를 보내는 참신한 아이디어로 ORM의 문제점을 어느 정도 해결하고 있다. 공식 깃허브에 나와 있는 다음 코드 한 줄이면 Pony ORM이 무엇인지 감이 올 것이다. 다만, 이 기법을 select 계열에만 적용한 것 같아서 아쉽다.
```python
select(p for p in Product if p.name.startswith('A') and p.cost <= 1000)
```

[Dapper](https://github.com/DapperLib/Dapper)(Stack Overflow)도 적절한 타협점을 찾은 것 같다. 저자에 따르면 일반적인 ORM의 많은 기능을 제거하여 단순성을 강조한 OM(Object Mapper)이라고 한다. SQL 문자열을 직접 사용하며, 실행 결과를 정적 객체(모델) 또는 동적 객체에 매핑한다. 어느 정도 ORM의 문제를 해결하면서도 ORM의 장점은 유지하는 상당히 직관적인 방법인 것 같다. 물론 다른 많은 ORM들도 Raw SQL을 선택지로 제공하고 있지만, Dapper는 아예 선택의 여지가 없다는 점이 차라리 매력적이다.

[NORM](https://github.com/hettie-d/NORM)(Hettie Dombrovskaya, Boris Novikov)이라는 시도가 눈에 띈다. 관계형 데이터베이스를 마치 NoSQL처럼 사용할 수 있게 하므로써 "객체-관계 임피던스 불일치" 문제로부터 자유롭게 해주는 것 같다. JSON 스키마에 따라 함수들과 타입 정의들을 데이터베이스에 생성하고, 애플리케이션에서 이 함수들을 호출하는 것이 큰 흐름이라고 한다. 웹 프레임워크보다는 데이터베이스 자체에 적용하는 기술로 보인다.

#### 개발 방향

어쨋든, 목표는 최대한 직관적인 CRUD 인터페이스와 간편한 객체-관계 매핑이다. 이제 ORM을 어떻게 만들 것인지 본격적으로 고민해보자. 다음과 같은 핵심 기능을 구현하려고 한다.

 - 메타 클래스를 사용하여 데이터베이스 결과를 매핑할 모델 클래스를 동적으로 구현
 - \_\_setattr\_\_ 또는 @property setter를 사용한 Dirty Checking
 - 요청 훅을 사용한 오토 커밋


#### 메타 클래스

ORM을 만든다면 메타 클래스를 빼놓을 수 없다. [파이썬 공식문서](https://docs.python.org/ko/3/reference/datamodel.html#uses-for-metaclasses)에도 메타 클래스의 용도 중 하나가 "프레임워크"라고 나와 있다.

공식 문서에 따르면 메타 클래스는 클래스를 만드는 과정을 커스터마이즈한다. 클래스를 단지 입맛대로 만드는 것이라면 일반적인 클래스 정의로도 가능하다. 굳이 메타 클래스가 존재한다는 것은 클래스를 입맛대로 만들되 "동적으로도" 만들 수 있다는 의미이다. 여기서 클래스를 만든다는 것은 클래스를 정의한다는 것이라고 생각해도 무방할 것이다.


아래는 일반 클래스 A와 A의 인스턴스인 객체 a를 나타낸다. 여기서 중요한 것은 A가 type의 인스턴스라는 부분이다. type은 파이썬 내장함수이자 메타 클래스이다. type 메타 클래스로부터 만들어진 인스턴스가 A라는 것은 A가 클래스이면서 객체이기도 하다는 의미이다. 이는 객체 지향 프로그래밍 언어의 특징이기도 하다.

![메타 클래스](/images/metaclass1.png)

아래는 일반 클래스 B를 정의할 때 메타 클래스 M을 인자로 전달하는 것을 나타낸다. M은 메타 클래스 type을 상속하는 메타 클래스이다. 클래스 B는 M의 인스턴스이자 type의 인스턴스이다. M의 \_\_new\_\_ 메소드는 M의 인스턴스를 만들 때 호출되는데, 이 경우 M의 인스턴스인 클래스 B를 만들 때(정의할 때) 호출된다.

![메타 클래스](/images/metaclass2.png)

아래와 같이 type 내장함수를 사용해도 위와 똑같은 커스터마이징을 수행할 수 있다. 마찬가지로 C는 type의 인스턴스이다.

![메타 클래스](/images/metaclass3.png)

새로 정의한 클래스의 인스턴스 변수를 추가하는 것도 가능하다. 이 테크닉은 후반부에서 나만의 객체 매퍼를 만들 때 활용할 것이다.

![메타 클래스](/images/metaclass4.png)


메타 클래스를 활용해 코드를 작성해보았다. 사용자가 Users로 리스트 컴프리헨션, 제너레이터 표현식 또는 리스트 슬라이싱을 작성하면 \_\_getitem\_\_을 거쳐 데이터 조회가 발생한다. 이 코드의 문제점은 전체 데이터를 조회한 다음 if 조건에 따라 필터링한다는 것이다. \_\_getitem\_\_이나 \_\_iter\_\_ 내부에서는 if 조건에 접근할 수 있는 방법이 없다. 리스트 컴프리헨션이나 제너레이터 표현식에서 if를 쓰는 편의성을 유지하면서 SQL문에 where를 설정하는 좋은 방법은 없을까?
```python
from types import SimpleNamespace

def get_data_from_db(tablename):
    return [
        SimpleNamespace(id=1, name="Keanu Reeves"),
        SimpleNamespace(id=2, name="Thomas Anderson"),
        SimpleNamespace(id=3, name="Sir Daniel Day-Lewis"),
        SimpleNamespace(id=4, name="Daniel Plainview"),
    ]

class MetaModel(type):
    # User는 MetaModel의 인스턴스이므로, __getitem__을 클래스 메소드로 가진다.
    # __getitem__이 여러번 호출되더라도 데이터베이스에는 한번만 접근한다.
    def __getitem__(cls, index):
        if index == 0:
            cls.data = get_data_from_db(cls.__name__) # 여기서는 where 조건을 인식할 수 없다.
        return cls.data[index]

class Users(metaclass=MetaModel):
    pass

users = [user for user in Users if "Sir" in user.name] # if 조건에 접근하려면?
print(users) # namespace(id=3, name='Sir Daniel Day-Lewis')
```

리스트 컴프리헨션이나 제너레이터 표현식의 if 조건에 접근하려면 특수한 방법이 필요할 것 같다. Pony ORM은 사용자가 작성한 제너레이터 표현식의 컴파일된 코드를 실행시간에 자체적으로 디컴파일하여 if 조건문을 알아내는 어마어마한 방법을 사용한다. 아래 예에서 select - make_query - decompile - result - generators - ifs 객체가 **'author', 'name', 'Eq', 'Author 1'** 라는 정보를 가지고 있음을 알 수 있다. 리스트 컴프리헨션의 경우는 실행시 즉시 평가되고 gi_code(제너레이터 이터레이터의 코드) 속성을 가지지 않으므로, Pony ORM이 사용한 방법을 적용할 수 없다.
```python
books = select(b for b in Book if b.author.name == "Author 1")[:]
```
![Pony ORM](/images/metaclass5.png)



#### Dirty Checking
객체의 변경 사항을 추적하는 Dirty Checking은 프로퍼티 세터를 활용하여 구현할 수 있다.

#### 오토 커밋
오토 커밋에 대한 내용은 조만간 이어서 작성할 예정.



### 참고

- [DB-API 2.0](https://peps.python.org/pep-0249/#connection-objects)
- [sqlite3](https://docs.python.org/ko/3.8/library/sqlite3.html)
- [asyncio](https://docs.python.org/ko/3/library/asyncio.html)
