---
summary: 파이썬 데이터 모델
category: language
tag: language
---

## 객체, 값, 형 : 객체의 ID, 타입, 값

파이썬에서 데이터는 객체, 그리고 객체 간의 관계로 표현됩니다. 객체가 그만큼 중요하다는 의미일 것입니다. 문서에 따르면 객체는 ID, 타입, 값을 갖는다고 하는데 하나씩 살펴보겠습니다.

#### ID가 같으면 같은 객체

첫 번째로, 객체는 객체의 고유한 메모리 주소인 ID를 갖습니다. ID가 같으면 같은 객체로 봐도 무방합니다. ID는 객체가 만들어질 때 타입에 의해 영향을 받습니다. 아래 코드에서는 값이 같을 경우 타입이 ID에 미치는 영향을 살펴보기 위해 is, id()를 사용합니다.

```python
baba, you = 'BABA', 'BABA'
babaL, youL = ['BABA'], ['BABA']
baba is you, id(baba) == id(you) # (True, True) - ID가 같으므로 같은 객체임을 의미
babaL is youL, id(babaL) == id(youL) # (False, False) - ID가 다르므로 다른 객체임을 의미
baba == you, babaL == youL # (True, True) - ID와 상관 없이 값이 같음을 의미
```

아래 코드에서 문자열 타입과 리스트 타입의 ID를 조금 더 살펴봅니다.

```python
s1 = 'BABA'
s2 = 'BABA' # s1과 같은 ID - 기존의 메모리에 존재하던 객체가 다시 참조되었음
s3 = s1[:] # s1과 같은 ID - 위와 동일
s4 = s1 # s1과 같은 ID - 위와 동일
s5 = s1[::-1][::-1] # s1과 다른 ID - 새로운 메모리 주소에 새로운 객체를 생성했음
id(s1), id(s2), id(s3), id(s4), id(s5)

l1 = ['BABA']
l2 = ['BABA'] # l1과 다른 ID - 새로운 메모리 주소에 새로운 객체를 생성했음
l3 = l1[:] # l1과 다른 ID - 위와 동일
l4 = l1.copy() # l1과 다른 ID - 위와 동일
l5 = l1 # l1과 같은 ID - 기존의 메모리에 존재하던 객체가 다시 참조되었음
id(l1), id(l2), id(l3), id(l4), id(l5)
```

#### 타입은 객체의 여러 가지를 결정

두 번째로, 객체는 객체가 갖는 값의 종류와 범위, 가능한 연산, 가변 객체 여부 등을 결정하는 타입을 갖습니다. type(), \__class__를 사용해 객체의 타입을 확인할 수 있습니다. 참고로 파이썬은 변수에 값이 할당될 때 변수의 타입이 변경될 수 있는 동적 타이핑 언어입니다.

```python
a = 0
type(a) # <class 'int'>
a = 'A'
type(a) # <class 'str'>
a = [1]
type(a) # <class 'list'>
a = True
type(a) # <class 'bool'>

a.__class__ # <class 'bool'>

type(bool) # <class 'type'>
type(type) # <class 'type'> ... type 이라는 타입
```

#### 값을 변경할 수 있는 객체와 값을 변경할 수 없는 객체

세 번째로, 객체는 값을 갖습니다. 객체가 만들어진 후에 값을 변경할 수 있으면 가변(mutable) 객체라고 하고, 변경할 수 없으면 불변(immutable) 객체라고 합니다. 대표적인 불변 타입으로는 문자열, 튜플, 바이트열이 있습니다. 단, 불변 컨테이너(튜플)가 참조하는 가변 객체의 값은 변경할 수 있습니다. 아래 코드를 보면, 튜플의 문자열 요소의 값은 변경할 수 없지만 튜플의 리스트 요소의 값은 변경할 수 있습니다.

```python
t = (1, [2])
t[0] = 0 # TypeError: 'tuple' object does not support item assignment
t[1][0] = 0 # (1, [0])
```

#### 객체를 없애는 방법

마지막으로 객체의 생명주기에 대해 짧게 살펴보겠습니다. 파이썬에서 객체를 명시적으로 파괴하는 방법은 없습니다. 다만 del 키워드를 사용해 객체에 대한 참조를 지울 수는 있습니다. 객체는 더 이상 참조되지 않으면 가비지 콜렉터에 의해 소멸됩니다. close() 의 역할은 객체를 파괴하거나 객체에 대한 참조를 지우는 것이 아니라, 외부자원을 반납하는 것입니다.



## 표준형 계층

### 추상 베이스 클래스와 가상 서브 클래스: 구스 타이핑

#### 상속을 하지 않는 서브 클래스

파이썬의 데이터 모델 문서에는 numbers.Number의 하위에 int가 있습니다. 얼핏 보면 int가 Number를 상속하는 것 같지만, \__bases__를 확인해보면 상속을 하지 않습니다. Number의 하위에 int가 있는 까닭은 int가 추상 베이스 클래스 Number의 가상 서브 클래스로 등록되어 있기 때문입니다. list나 tuple이 Sequence로 분류되어 있는 것도 같은 이유입니다. 아래 코드는 int가 Number의 서브 클래스라는 것을 확인하고 있습니다.

```python
import numbers
int.__bases__ # (<class 'object'>,)
issubclass(int, numbers.Number) # True
isinstance(1, numbers.Number) # True
```

#### 인터페이스를 구현하는 다양한 방법들

파이썬의 인터페이스, 상속, 프로토콜, 덕 타이핑, 구스 타이핑에 대해 간단히 정리하겠습니다. 인터페이스는 객체가 어떻게 동작하는지를 규정합니다. A()라는 인터페이스를 갖고 있는 객체에게 A()라는 동작을 기대할 수 있습니다. 파이썬이 인터페이스를 구현하기 위해 추상 클래스 상속, 덕 타이핑, 구스 타이핑 등의 방법을 제공합니다. 첫번째는 abc.ABC와 abc.abstractmethod를 사용한 추상 클래스 상속입니다. 이 경우 추상 메소드 구현이 강제됩니다. 두번째는 덕 타이핑입니다. 오리처럼 걷고 꽥꽥거리는 메소드(예:\_\_len\_\_, \__getitem\_\_)를 구현하면 오리 객체(Sequence)로 인정받는 방법입니다. 이때 이러이러한 메소드를 구현하면 이러이러한 객체다라는 묵시적인 약속을 프로토콜이라고 하며, 특히 파이썬 3.8 부터는 Protocol이라는 클래스가 도입되어 사용자가 직접 약속을 만들고 mypy 등으로 정적 검사가 가능하게 되었습니다. 세번째는 추상 베이스 클래스와 가상 서브 클래스를 사용한 구스 타이핑입니다. 모든 추상 메소드를 구현하지 않아도 되는 느슨한 방법입니다. 아래는 register를 사용하여 가상 서브 클래스를 등록하는 collections.abc 소스 코드입니다.

```python
MutableSequence.register(list) # __subclasshook__, @register도 가능
MutableSequence.register(bytearray)
```

#### 자주 사용하는 타입들이 물려받은 특성들

아래 표는 자주 사용하는 타입들이 어떤 추상 베이스 클래스의 서브 클래스인지 issubclass로 확인한 결과입니다. str, tuple, list, set, range, dict가 반복 가능하다는 것은 Iterable 추상 베이스 클래스의 특성 때문이라는 것, str, tuple, list, range의 요소의 순서가 정해져 있다는 것은 Sequence 추상 베이스 클래스의 특성 때문이라는 것 등을 미루어 짐작할 수 있습니다. 불변인 str이 MutableSequence 추상 베이스 클래스의 서브 클래스가 아니라는 것도  알 수 있습니다.

```python
                [' str ', 'tuple', 'list ', ' set ', 'range', 'dict ', 'bytes', 'bytearray']
AsyncGenerator  ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
AsyncIterable   ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
AsyncIterator   ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
Awaitable       ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
ByteString      ['     ', '     ', '     ', '     ', '     ', '     ', '  o  ', '  o  ']
Callable        ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
Collection      ['  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ']
Container       ['  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ']
Coroutine       ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
Generator       ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
Hashable        ['  o  ', '  o  ', '     ', '     ', '  o  ', '     ', '  o  ', '     ']
ItemsView       ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
Iterable        ['  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ']
Iterator        ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
KeysView        ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
Mapping         ['     ', '     ', '     ', '     ', '     ', '  o  ', '     ', '     ']
MappingView     ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
MutableMapping  ['     ', '     ', '     ', '     ', '     ', '  o  ', '     ', '     ']
MutableSequence ['     ', '     ', '  o  ', '     ', '     ', '     ', '     ', '  o  ']
MutableSet      ['     ', '     ', '     ', '  o  ', '     ', '     ', '     ', '     ']
Reversible      ['  o  ', '  o  ', '  o  ', '     ', '  o  ', '  o  ', '  o  ', '  o  ']
Sequence        ['  o  ', '  o  ', '  o  ', '     ', '  o  ', '     ', '  o  ', '  o  ']
Set             ['     ', '     ', '     ', '  o  ', '     ', '     ', '     ', '     ']
Sized           ['  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ', '  o  ']
ValuesView      ['     ', '     ', '     ', '     ', '     ', '     ', '     ', '     ']
```

위 표를 출력하는 코드입니다.

```python
import collections.abc

cls = [str, tuple, list, set, range, dict, bytes, bytearray]
abcs = sorted(collections.abc.__all__)

print(" "*15, [f'{s.__name__:^5s}' for s in cls])

for acls in abcs:
    cells = []
    for i in range(len(cls)):
        acls_ = eval("collections.abc."+acls)
        cells.append(f'{("o" if issubclass(cls[i], acls_) else " "):^5s}')
    print(f'{acls:15s}', cells)
```

#### 추상 베이스 클래스간 관계

각 추상 베이스 클래스간 관계는 아래와 같습니다. 대부분의 추상 베이스 클래스가 Hashable, Iterable, Sized, Container, Collection의 서브 클래스입니다. 또한 Hashable <- Iterable, Sized, Container <- Collection 라는 관계를 파악할 수 있는데, Collection이 Hashable의 하위에 있다고 해서 Collection의 가상 서브 클래스가 꼭 \_\_hash\_\_를 구현할 필요는 없습니다(예:[list](https://github.com/python/cpython/blob/main/Objects/listobject.c)). 이는 꼭 필요한 추상 메소드만 구현하는 구스 타이핑의 특징입니다. 참고로, 가장 상위에 존재하는 Hashable은 hash 함수의 인자로 들어갈 수 있는 불변 타입입니다. 객체를 비교하거나 검색하기 위해 특수 메소드 \_\_hash\_\_를 통해 객체의 고유한 해시값을 리턴합니다. 

```
Hashable <- ['AsyncGenerator', 'AsyncIterable', 'AsyncIterator', 'Awaitable', 'ByteString', 'Callable', 'Collection', 'Container', 'Coroutine', 'Generator', 'Iterable', 'Iterator', 'MappingView', 'MutableSequence', 'Reversible', 'Sequence', 'Sized', 'ValuesView']

Iterable <- ['ByteString', 'Collection', 'Generator', 'ItemsView', 'Iterator', 'KeysView', 'Mapping', 'MutableMapping', 'MutableSequence', 'MutableSet', 'Reversible', 'Sequence', 'Set', 'ValuesView']

Sized <- ['ByteString', 'Collection', 'ItemsView', 'KeysView', 'Mapping', 'MappingView', 'MutableMapping', 'MutableSequence', 'MutableSet', 'Sequence', 'Set', 'ValuesView']

Container <- ['ByteString', 'Collection', 'ItemsView', 'KeysView', 'Mapping', 'MutableMapping', 'MutableSequence', 'MutableSet', 'Sequence', 'Set', 'ValuesView']

Collection <- ['ByteString', 'ItemsView', 'KeysView', 'Mapping', 'MutableMapping', 'MutableSequence', 'MutableSet', 'Sequence', 'Set', 'ValuesView']

MappingView <- ['ItemsView', 'KeysView', 'ValuesView']
Reversible <- ['ByteString', 'MutableSequence', 'Sequence']
Set <- ['ItemsView', 'KeysView', 'MutableSet']
AsyncIterable <- ['AsyncGenerator', 'AsyncIterator']
Sequence <- ['ByteString', 'MutableSequence']
AsyncIterator <- ['AsyncGenerator']
Awaitable <- ['Coroutine']
Iterator <- ['Generator']
Mapping <- ['MutableMapping']
```

```
                A  A  A  A  B  C  C  C  C  G  H  I  I  I  K  M  M  M  M  M  R  S  S  S  V
                s  s  s  w  y  a  o  o  o  e  a  t  t  t  e  a  a  u  u  u  e  e  e  i  a
                y  y  y  a  t  l  l  n  r  n  s  e  e  e  y  p  p  t  t  t  v  q  t  z  l
                n  n  n  i  e  l  l  t  o  e  h  m  r  r  s  p  p  a  a  a  e  u     e  u
                c  c  c  t  S  a  e  a  u  r  a  s  a  a  V  i  i  b  b  b  r  e     d  e
                G  I  I  a  t  b  c  i  t  a  b  V  b  t  i  n  n  l  l  l  s  n        s
                e  t  t  b  r  l  t  n  i  t  l  i  l  o  e  g  g  e  e  e  i  c        V
                n  e  e  l  i  e  i  e  n  o  e  e  e  r  w     V  M  S  S  b  e        i
                e  r  r  e  n     o  r  e  r     w              i  a  e  e  l           e
                r  a  a     g     n                             e  p  q  t  e           w
                a  b  t                                         w  p  u
                t  l  o                                            i  e
                o  e  r                                            n  n
                r                                                  g  c
                                                                      e
Hashable        o  o  o  o  o  o  o  o  o  o        o  o        o     o     o  o     o  o
Iterable                    o     o        o     o     o  o  o     o  o  o  o  o  o     o
Sized                       o     o              o        o  o  o  o  o  o     o  o     o
Container                   o     o              o        o  o     o  o  o     o  o     o
Collection                  o                    o        o  o     o  o  o     o  o     o
MappingView                                      o        o                             o
Reversible                  o                                         o        o
Set                                              o        o              o
AsyncIterable   o     o
Sequence                    o                                         o
AsyncIterator   o
Awaitable                               o
Iterator                                   o
Mapping                                                            o
```
```
Hashable :
AsyncIterable : Hashable
Awaitable : Hashable
Callable : Hashable
Container : Hashable
Iterable : Hashable
Sized : Hashable
AsyncIterator : AsyncIterable, Hashable
Coroutine : Awaitable, Hashable
Iterator : Hashable, Iterable
MappingView : Hashable, Sized
Reversible : Hashable, Iterable
AsyncGenerator : AsyncIterable, AsyncIterator, Hashable
Generator : Hashable, Iterable, Iterator
Collection : Container, Hashable, Iterable, Sized
Mapping : Collection, Container, Iterable, Sized
Set : Collection, Container, Iterable, Sized
MutableMapping : Collection, Container, Iterable, Mapping, Sized
MutableSet : Collection, Container, Iterable, Set, Sized
ItemsView : Collection, Container, Iterable, MappingView, Set, Sized
KeysView : Collection, Container, Iterable, MappingView, Set, Sized
Sequence : Collection, Container, Hashable, Iterable, Reversible, Sized
ValuesView : Collection, Container, Hashable, Iterable, MappingView, Sized
ByteString : Collection, Container, Hashable, Iterable, Reversible, Sequence, Sized
MutableSequence : Collection, Container, Hashable, Iterable, Reversible, Sequence, Sized
```

위 내용을 출력하는 코드입니다.

```python
import collections.abc
from collections.abc import *

notincluded = []
abcs = [ eval(cls) for cls in sorted(collections.abc.__all__) if cls not in notincluded ]

d = {c.__name__:[] for c in abcs}
d2 = {c.__name__:[] for c in abcs}

for a in abcs:
    for b in abcs:
        if(a != b and issubclass(a,b)):
            d[b.__name__].append(a.__name__)
            d2[a.__name__].append(b.__name__)

for c in dict(sorted(d.items(), key=lambda item: -len(item[1]))).items():
    if len(c[1]) > 0:
        print(c[0], "<-", c[1])
      
cls = [eval("collections.abc."+c) for c in sorted(collections.abc.__all__)]
abcs = sorted(collections.abc.__all__)

headermax = max([len(s) for s in abcs])
for i in range(headermax):
    print(" "*15, "  ".join([s[i] if len(s) > i else ' ' for s in abcs]))

for c in dict(sorted(d.items(), key=lambda item: -len(item[1]))).items():
    cells = []    
    cls = c[0]
    if len(c[1]) > 0:
        for acls in abcs:
            cls_ = eval("collections.abc."+cls)
            acls_ = eval("collections.abc."+acls)
            cells.append(f'{("o" if issubclass(acls_, cls_) and acls_ != cls_ else " "):^3s}')
        print(f'{cls:14s}', "".join(cells))

for c in dict(sorted(d2.items(), key=lambda item: len(item[1]))).items():
    print(c[0], ":", ", ".join(c[1]))

```
### 표준 타입 계층

#### 빌트인 타입

아래와 같은 빌트인 타입이 있습니다. 시퀀스 타입의 경우, 컨테이너 시퀀스(다양한 종류의 타입 참조를 가짐) 또는 플랫 시퀀스(단 한 종류의 기본 타입 값을 가짐)로 구분하거나, 가변 시퀀스(객체 생성 후 값의 변경이 가능) 또는 불변 시퀀스(객체 생성 후 값의 변경이 불가능)로 구분할 수 있습니다.

```
- None, NotImplemented, Ellipsis
- numbers.Number
  - numbers.Integral : int  bool
  - numbers.Real : float
  - numbers.Complex : complex
- 시퀀스들
  - 컨테이너 시퀀스 : tuple  list  collections.deque
  - 플랫 시퀀스 : str  bytes  bytearray  memoryview  array.array
  - 가변 시퀀스 : list  collections.deque  bytearray  memoryview  array.array
  - 불변 시퀀스 : str  bytes  tuple
- 집합 형들 : set  frozenset
- 매핑 : dict
- 콜러블 : 사용자정의함수, 인스턴스메서드, 제너레이터함수, 코루틴함수, 비동기제너레이터함수, 내장함수, 내장메서드, 클래스, 클래스인스턴스
- 기타 특수한 빌트인 타입 다수 존재
```



## 특수 메소드 이름들

### 특수 메소드

특수 메소드는 이름의 시작과 끝이 더블 언더바로 이루어진 메소드입니다. 클래스에서 흔히 사용하는 \_\_init\_\_이 대표적인 특수 메소드입니다. 더블 언더바를 줄여 던더 메소드 혹은 매직 메소드라고도 합니다.

#### 특수 메소드를 구현하는 한 가지 이유

파이썬의 특수 메소드는 프로토콜을 사용하여 인터페이스를 구현하는 강력한 기능을 제공합니다. 예를 들어 우리가 어떤 클래스를 정의할 때 시퀀스 프로토콜에 따라 몇 가지 특수 메소드를 구현해주면, 슬라이싱과 정렬 및 기타 표준 라이브러리의 기능 등을 사용할 수 있게 됩니다. 이 과정에서 특수 메소드가 프로토콜에 의해 파이썬 내부적으로 호출되어, 시퀀스형과 동일한 동작이 가능해집니다. 아래 코드는 Sequence 추상 베이스 클래스의 \_\_len\_\_과 \_\_getitem\_\_ 특수 메소드를 구현한 커스텀 객체가 마치 시퀀스처럼 동작하는 것을 보여줍니다.

```python
class MyList:
    def __init__(self, data):
        self.data = data
        
    def __len__(self):
        return len(self.data)
        
    def __getitem__(self, index):
        return self.data[index]

mylist = MyList([1,2,3,4,5])
print(mylist[0:3]) # [1, 2, 3]
print(sorted(mylist, reverse=True)) # [5, 4, 3, 2, 1]
print(tuple(mylist)) # (1, 2, 3, 4, 5)
print(set(mylist)) # {1, 2, 3, 4, 5}
for n in mylist:
    print(n) # 1 2 3 4 5
```

#### 주요 추상 메소드

collections.abc 모듈의 추상 베이스 클래스들이 제공하는 추상 메소드들은 아래와 같습니다.  각 추상 베이스 클래스의 특징은 [공식문서](https://docs.python.org/ko/3/library/collections.abc.html)에 나와있습니다.

```
AsyncGenerator : asend, athrow
AsyncIterable : __aiter__
AsyncIterator : __anext__
Awaitable : __await__
ByteString : __getitem__, __len__
Callable : __call__
Collection : __contains__, __iter__, __len__
Container : __contains__
Coroutine : send, throw
Generator : send, throw
Hashable : __hash__
ItemsView : 
Iterable : __iter__
Iterator : __next__
KeysView : 
Mapping : __getitem__, __iter__, __len__
MappingView : 
MutableMapping : __getitem__, __setitem__, __delitem__, __iter__, __len__
MutableSequence : __getitem__, __setitem__, __delitem__, __len__, insert
MutableSet : __contains__, __iter__, __len__, add, discard
Reversible : __reversed__
Sequence : __getitem__, __len__
Set : __contains__, __iter__, __len__
Sized : __len__
ValuesView : 
```
#### 핵심 추상 베이스 클래스의 특수 메소드

Hashable, Iterable, Sized, Container, Collection의 특수 메소드는 아래와 같습니다.

```
Hashable : __hash__
Iterable : __iter__
Sized : __len__
Container : __contains__
Collection : __contains__, __iter__, __len__
```

### 특수 메소드의 다양한 용도

특수 메소드는 이외에도 다양한 용도가 있습니다. 아래는 공식 문서에서 제공하는 분류입니다. 앞에서 살펴본 프로토콜을 사용한 인터페이스 구현은 "흉내 내기"에 해당합니다.

#### 기본적인 커스터마이제이션

```
__new__ : 클래스의 새 인스턴스를 만들기 위해 호출됨
__init__ : 인스턴스가 만들어진 후에 호출됨
__del__ : 인스턴스가 파괴되기 직전에 호출
__repr__ : 객체의 문자열 표현을 위해 호출됨
__str__ : 객체의 문자열 표현을 위해 호출됨
__bytes__ : 객체의 바이트열 표현을 위해 호출됨
__format__ : 객체의 문자열 표현을 위해 호출됨
__lt__, __le__, __eq__, _ne__, __gt__, __ge__ : 연산자 오버로딩을 위해 호출됨
__hash__ : 해시형 컬렉션의 멤버에 대한 연산에서 호출됨
__bool__ : 논리값 검사를 위해 호출됨
```

#### 어트리뷰트 액세스 커스터마이제이션

\_\_slots\_\_를 사용하면 \_\_dict\_\_에 비해 메모리를 절약할 수 있습니다.

```
__getattr__ : 기본 어트리뷰트 액세스가 실패할 때 호출됨
__getattribute__ : 클래스 인스턴스의 어트리뷰트 액세스를 구현하기 위해 조건 없이 호출됨
__setattr__ : 어트리뷰트 대입이 시도될 때 호출됨
__delattr__ : 어트리뷰트를 대입하는 대신에 삭제할 때 호출됨
__dir__ : 객체에 dir() 이 호출될 때 호출됨
__get__ : 소유자 클래스나 그 클래스의 인스턴스의 어트리뷰트를 취하려고 할 때 호출됨
__set__ : 소유자 클래스의 인스턴스의 어트리뷰트를 새 값으로 설정할 때 호출됨
__delete__ : 소유자 클래스의 인스턴스의 어트리뷰트를 삭제할 때 호출됨
__set_name__ : 소유자 클래스가 만들어질 때 호출됨
__slots__ : 클래스 변수. 데이터 멤버를 명시적으로 선언. __dict__ 와 __weakref__ 생성을 거부
```

#### 클래스 생성 커스터마이제이션

```
__init_subclass__ : 클래스의 서브 클래스가 만들어질 때마다 호출
메타클래스 : enum, 로깅, 인터페이스 검사, 자동화된 위임, 자동화된 프로퍼티 생성, 프락시, 프레임웍, 자동화된 자원 로킹/동기화 등을 구현하고 싶을 때 참고
```

#### 인스턴스 및 서브 클래스 검사 커스터마이제이션

```
__instancecheck__ : isinstance() 와 issubclass() 내장 함수들의 기본 동작을 재정의하는 데 사용
__subclasscheck__ : isinstance() 와 issubclass() 내장 함수들의 기본 동작을 재정의하는 데 사용
```

#### 제네릭 형 흉내 내기

```
__class_getitem__ : 제네릭 클래스 문법(예를 들면 List[int])을 구현하고 싶을 때 참고
```

#### 콜러블 객체 흉내 내기

```
__call__ : 인스턴스가 함수처럼 "호출될" 때 호출됨
```

#### 컨테이너형 흉내 내기

```
__len__ : 내장함수 len() 를 구현하기 위해 호출됨
__length_hint__ : operator.length_hint() 를 구현하기 위해 호출됨
__getitem__ : self[key] 의 값을 구하기 위해 호출됨
__setitem__ : self[key] 로의 대입을 구현하기 위해 호출됨
__delitem__ : self[key] 의 삭제를 구현하기 위해 호출됨
__missing__ : dict.__getitem__() 이 dict 서브 클래스에서 키가 딕셔너리에 없으면 self[key] 를 구현하기 위해 호출
__iter__ : 컨테이너의 이터레이터가 필요할 때 이 메서드가 호출됨
__reversed__ : reversed() 내장 함수가 역 이터레이션(reverse iteration)을 구현하기 위해 호출됨
__contains__ : 멤버십 검사 연산자를 구현하기 위해 호출됨
```

#### 숫자 형 흉내 내기

```
__add__, __sub__, __mul__, __matmul__, __truediv__, __floordiv__, __mod__, __divmod__, __pow__, __lshift__, __rshift__, __and__, __xor__, __or__
: 이항 산술 연산들(+, -, *, @, /, //, %, divmod(), pow(), **, <<, >>, &, ^, |)을 구현하기 위해 호출됨

__radd__, __rsub__, __rmul__, __rmatmul__, __rtruediv__, __rfloordiv__, __rmod__, __rdivmod__, __rpow__, __rlshift__, __rrshift__, __rand__, __rxor__, __ror__
: 뒤집힌 피연산자들에 대해 이항 산술 연산들을 구현하기 위해 호출됨

__iadd__, __isub__, __imul__, __imatmul__, __itruediv__, __ifloordiv__, __imod__, __ipow__, __ilshift__, __irshift__, __iand__, __ixor__, __ior__
: 증분 산술 대입(+=, -=, *=, @=, /=, //=, %=, **=, <<=, >>=, &=, ^=, |=)을 구현하기 위해 호출됨

__neg__, __pos__, __abs__, __invert__
: 일항 산술 연산(-, +, abs(), ~)을 구현하기 위해 호출됨

__complex__, __int__, __float__
: 내장 함수 complex(), int(), float()를 구현하기 위해 호출됨

__index__
: operator.index() 를 구현하기 위해 호출됨

__round__, __trunc__, __floor__, __ceil__
: 내장 함수 round()와 math 함수 trunc(), floor(), ceil() 을 구현하기 위해 호출됨
```

#### with 문 컨텍스트 관리자

```
__enter__ : 이 객체와 연관된 실행시간 컨텍스트에 진입
__exit__ : 이 객체와 연관된 실행시간 컨텍스트를 종료
```

#### 특수 메서드 조회

```
객체의 인스턴스 딕셔너리가 아닌 객체의 형에 정의되어 있을 때만 올바르게 동작함이 보장
```

#### 코루틴

```
__await__ : 어웨이터블 객체를 구현하기 위해 사용
__aiter__ : 비동기 이터레이터 객체를 돌려줘야 함
__anext__ : 이터레이터의 다음 값을 주는 어웨이터블을 돌려줘야 함
__aenter__ : __enter__() 메서드와 의미상으로 유사. 어웨이터블을 돌려줘야 함
__aexit__ : __exit__() 메서드와 의미상으로 유사. 어웨이터블을 돌려줘야 함
```



### 참고

- 객체, 값, 형

  - [데이터모델](https://docs.python.org/ko/3/reference/datamodel.html#objects-values-and-types), [EN](https://docs.python.org/3/reference/datamodel.html#objects-values-and-types), [주석판](https://python.flowdas.com/reference/datamodel.html#objects-values-and-types)
  - [실용 파이썬 프로그래밍 - 객체](https://wikidocs.net/84394)

- 표준형 계층

  - [데이터모델](https://docs.python.org/ko/3/reference/datamodel.html#the-standard-type-hierarchy), [EN](https://docs.python.org/3/reference/datamodel.html#the-standard-type-hierarchy), [주석판](https://python.flowdas.com/reference/datamodel.html#the-standard-type-hierarchy)
  - [추상 베이스 클래스](https://docs.python.org/ko/3/glossary.html#term-abstract-base-class)
  - [추상 베이스 클래스](https://docs.python.org/ko/3/library/abc.html)
  - [collections.abc](https://docs.python.org/ko/3/library/collections.abc.html)
  - [Why int is subclass of numbers.Number?](https://stackoverflow.com/questions/67077519/why-int-is-subclass-of-number-number)
  - [파이썬과 인터페이스: 프로토콜에서 ABC까지](https://medium.com/humanscape-tech/%ED%8C%8C%EC%9D%B4%EC%8D%AC%EA%B3%BC-%EC%9D%B8%ED%84%B0%ED%8E%98%EC%9D%B4%EC%8A%A4-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EC%97%90%EC%84%9C-abc%EA%B9%8C%EC%A7%80-118bc5aed344)
  - [실용 파이썬 프로그래밍 - 설계에 관한 논의](https://wikidocs.net/84415)
  - [Interfaces in Python: Protocols and ABCs](http://masnun.rocks/2017/04/15/interfaces-in-python-protocols-and-abcs/)
  - [Building Implicit Interfaces in Python with Protocol Classes](https://andrewbrookins.com/technology/building-implicit-interfaces-in-python-with-protocol-classes/)
  - [What's the usage of a virtual subclass?](https://stackoverflow.com/questions/51666120/whats-the-usage-of-a-virtual-subclass)
  - [_collections.abc.py](https://github.com/python/cpython/blob/3.8/Lib/_collections_abc.py)
  - [Hashable 이란? 쉬운 설명: python](https://analytics4everything.tistory.com/138)

- 특수 메소드 이름들

  - [데이터모델](https://docs.python.org/ko/3/reference/datamodel.html#special-method-names), [EN](https://docs.python.org/3/reference/datamodel.html#special-method-names), [주석판](https://python.flowdas.com/reference/datamodel.html#special-method-names)
  - [파이썬 코딩 테크닉](https://gritmind.blog/2020/12/21/python_technique/)
  - [실용 파이썬 프로그래밍 - 딕셔너리 톺아보기](https://wikidocs.net/84420)
  - [디스크립터 사용법 안내서](https://docs.python.org/ko/3/howto/descriptor.html)
  
  

