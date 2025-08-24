---
summary: 파이썬 입출력, 스트림, 인코딩, 버퍼
category: language
tags: [python, network]
---

### 입출력

#### 데이터의 이동

입출력은 컴퓨터↔사용자, 컴퓨터↔컴퓨터, 기억장치↔연산장치, 프로세스↔프로세스 등 다양한 두 대상 간에 데이터가 오가는 것을 말합니다. 입력의 예로 키보드, 마우스, 파일, 프로세스, 네트워크 등으로부터 데이터를 받아들이는 것이 있고, 출력의 예로 종이, 모니터, 파일, 프로세스, 네트워크 등으로 데이터를 내보내는 것이 있습니다. 기억해야 할 핵심은 데이터가 오간다는 것입니다. 한편, 일반적으로 입출력 장치들은 CPU에 비해 처리 속도가 매우 느리기 때문에, 데이터를 주고받을 때 CPU의 대기시간을 최소화하기 위해 여러 가지 방법들이 고안되었습니다.

### 스트림

#### 운영체제가 프로그램에 제공하는 데이터 이동 통로

예전에는 다양한 입출력 각각에 대해 제어하는 코드가 프로그램마다 중복되었기에, 이를 보다 고수준에서 다루어야 할 필요가 있었습니다. 운영체제가 데이터의 흐름에 대한 인터페이스를 스트림이라는 이름으로 프로그램에 제공하게 되었습니다. 스트림은 데이터가 흘러가는 이동 통로를 의미합니다. 데이터가 높은 곳(source=출발지)에서 낮은 곳(sink=목적지)으로 한 방향으로 흘러가는 모습이 '흐르는 물'과 같다 하여 스트림이라는 표현을 사용합니다. 네트워크에서 TCP 소켓을 스트림 소켓이라고 부르는데, UDP 소켓과 달리 TCP 소켓은 계속 연결된 상태로 데이터 이동 통로(스트림)를 유지하기에 그렇게 부르는 것이 아닐까 합니다.

프로그램이 키보드, 텍스트 터미널, 파일, 소켓 등 어떤 입출력에 접근할 때, 운영체제는 해당 입출력과 프로그램 사이에 스트림(입력 스트림, 출력 스트림 등)을 제공합니다. 프로그램은 제공받은 스트림을 통해 데이터를 받거나 내보내는데, 이들 데이터 조각들은 시간이 경과됨에 따라 차례대로 목적지에 도달합니다. 기억해야 할 것은 프로그램이 입출력에 직접 접근하는 것이 아니라 (스트림이라는) 한 다리를 건너서 데이터를 주고 받는다는 것입니다. 

#### 데이터 이동 작업의 효율을 높여주는 버퍼

스트림이 CPU보다 처리 속도가 느린 입출력에 사용될 경우, CPU의 효율성을 높이기 위해 버퍼라는 도구의 도움을 받습니다. 버퍼는 사람이 어느 정도 모여야 출발하는 롤러코스터 대기열과 같습니다. 버퍼가 가득 찰 때까지 데이터 조각(chunk)들을 모았다가 한꺼번에 보내는 방식으로 입출력 횟수를 최소화하여 성능을 향상시킵니다. 버퍼를 사용하지 않을 경우 입출력 횟수가 증가하여 성능이 낮아지게 됩니다. 버퍼 사용 유무에 따른 성능차는 뒤에서 코드를 통해 확인해 보도록 하겠습니다.

### 표준 입출력 (스트림)

#### 기본으로 제공되는 스트림

프로그램이 시작될 때 기본적으로 연결되어 있는 세 개의 스트림이 있는데, 이를 표준 입출력 (스트림)이라고 부릅니다. 이들은 파일이나 소켓 입출력처럼 프로그램이 직접 생성을 요청하는 스트림과는 별도입니다. 프로그램에서 input()과 print() 등을 사용하여 콘솔(키보드와 텍스트 터미널)과 상호작용하면 (이미 생성되어 있던) 표준 입출력 스트림이 내부적으로 사용됩니다. 파이썬 sys 모듈은 데이터를 받는 표준 입력 스트림(sys.stdin), 데이터를 내보내는 표준 출력 스트림(sys.stdout), 오류 메시지를 내보내는 표준 오류 스트림(sys.stderr)을 제공합니다. 별도의 리다이렉션이 없을 경우 기본적으로 표준 입력 스트림은 키보드에 연결되어 있고, 표준 출력 스트림은 텍스트 터미널에 연결되어 있습니다.

```shell
>>> help(input)
... Read a string from standard input. ...

>>> help(print)
... Prints the values to a stream, or to sys.stdout by default. ...
```

#### 표준 입출력을 자유자재로 - 리다이렉트와 파이프

리다이렉트는 표준 입력이나 표준 출력을 변경하기 위해 운영체제가 제공하는 도구입니다. 아래 CLI 명령어는 파이썬 프로그램의 표준 입력과 표준 출력을 파일로 변경합니다.

```shell
$ python py.py < py.py > out.txt
```

코드가 실행되면 input()은 파일(py.py)과 연결된 표준 입력 스트림으로부터 데이터를 받고, print()는 파일(out.txt)과 연결된 표준 출력 스트림으로 데이터를 내보냅니다. 아래는 out.txt의 내용입니다.

```python
line = ' '...
while line:...
    try:...
        line = input()...
        print(line + "...")...
    except EOFError:...
        break...
```

운영체제는 어떤 표준 출력을 다른 표준 입력으로 연결하기 위해 파이프라는 도구도 제공합니다. 스트림과 스트림을 연결하는 것을 파이핑이라고 합니다. 아래는 dir 명령어의 표준 출력을 파이썬 프로그램의 표준 입력에 연결합니다.

```shell
$ dir | python py.py
```

```shell
 C 드라이브의 볼륨에는 이름이 없습니다....
 볼륨 일련 번호: E22E-D4EB...
...
```

### 파이썬 입출력

#### 텍스트 시퀀스와 바이너리 시퀀스

파이썬에서 입출력 사용시 각 입출력 유형에 적합한 시퀀스 자료형이 아닐 경우 예외가 발생됩니다. 파이썬 입출력 유형을 살펴보기 전에 입출력에 사용되는 자료형을 먼저 살펴보겠습니다. 파이썬에는 텍스트 시퀀스와 바이너리 시퀀스라는 시퀀스 자료형(예:리스트,튜플,레인지...)이 있습니다.

#### 텍스트 시퀀스

먼저 텍스트 시퀀스 자료형인 `str` 타입부터 보겠습니다. 파이썬에서 문자열은 0x0 - 0x10FFFF 범위의 유니코드 코드를 포인트하는 불변의 시퀀스입니다. 문자열이 입출력에 사용될 때 엔디안 문제, 바이트들로 저장하는 문제 등으로 인해 인코딩과 디코딩이 요구됩니다. 리터럴(따옴표) 또는 str 생성자를 사용하여 어떤 객체로부터 문자열을 만들 수 있습니다. str 생성자는 숫자를 문자열로 바꿀 때에도 사용하지만, 입출력에서 bytes나 bytearray 객체 등을 문자열로 바꿀 때에도 사용합니다. str 타입은 입출력과 관련하여 str(object=b'', encoding='utf-8', errors='strict'), str.encode(encoding='utf-8', errors='strict') 등을 제공합니다.

#### 바이너리 시퀀스

다음으로 바이너리 시퀀스 자료형인 `bytes`와 `bytearray` 타입을 살펴보겠습니다. bytes 는 단일 바이트들로 이루어진 불변의 시퀀스입니다. ASCII 문자만 허용합니다. 문자열을 bytes로 바꿀 때에도 인코딩이 필요합니다. 리터럴(b'') 또는 bytes 생성자를 사용하여 bytes 객체를 만들 수 있습니다. bytearray는 bytes와 유사하지만 가변입니다. 리터럴은 없으며 bytearray 생성자를 사용하여 bytearray 객체를 만들 수 있습니다. 이들은 입출력과 관련하여 bytes([source[, encoding[, errors]]]), bytearray([source[, encoding[, errors]]]) 등을 제공합니다. 참고로 bytes와 bytearray는 헥스 문자열과의 변환을 위한 fromhex() 클래스메소드와 hex() 메소드를 제공합니다. 또한, bytes와 bytearray는 [struct](https://docs.python.org/ko/3.10/library/struct.html) 모듈의 pack(), unpack()과 함께 사용되기도 합니다. bytes, bytearray 보다 더욱 빠른 바이너리 처리가 필요하다면 [버퍼 프로토콜](https://docs.python.org/ko/3/c-api/buffer.html#buffer-protocol)을 이용하는 [memoryview](https://docs.python.org/ko/3/library/stdtypes.html#memoryview)를 살펴보는 것도 좋겠습니다.

#### 텍스트 시퀀스와 바이너리 시퀀스 간 변환

이들 텍스트 시퀀스와 바이너리 시퀀스는 인코딩 혹은 디코딩 과정을 거쳐 서로 변환할 수 있습니다. 리터럴을 사용하는 방법, str, bytes, bytearray 객체를 사용하는 방법 등이 있습니다. encode()와 decode()의 encoding 파라미터 기본값은 'utf-8'입니다.

```python
# text to binary
b'myStr'
'myStr'.encode() # 'myStr'.encode(encoding='utf-8')과 동일
bytes('myStr', 'utf-8')
bytearray('myStr', 'utf-8')

# binary to text
b'myBytes'.decode() # b'myBytes'.decode(encoding='utf-8')과 동일
str(b'myBytes', 'utf-8')
```

#### 인코딩, 디코딩, 유니코드, UTF-8

위에서 인코딩, 디코딩, 유니코드, UTF-8이라는 용어를 사용했습니다. 원래 인코딩과 디코딩은 더 넓은 의미가 있으나, 여기서는 문자열에 한정하여 생각해보겠습니다. 문자열을 바이트 시퀀스로 변환하는 것을 인코딩이라고 하고, 바이트 시퀀스에서 문자열을 다시 만드는 것을 디코딩이라고 합니다. 문자열을 어떻게 바이트로 표현할 것인가가 인코딩의 관심사라고 하겠습니다. 예를 들어 mystr.encode(encoding='utf-8') 라는 코드는 문자열 mystr을 utf-8 형식으로 인코딩한 바이트 시퀀스를 만듭니다. 참고로 파이썬은 다양한 [표준 인코딩](https://docs.python.org/ko/3.10/library/codecs.html#standard-encodings)을 지원합니다. 다음으로, 유니코드는 전 세계 거의 모든 문자와 코드가 1:1 매핑(예:"가"=U+AC00)되도록 협의를 통해 만든 테이블입니다. 아래 코드에서는 [ord](https://docs.python.org/ko/3/library/functions.html#ord) 내장 함수와 [포맷스트링](https://docs.python.org/ko/3/library/string.html#formatstrings)을 사용하여 "가"의 유니코드 코드 포인트(44032)와 유니코드 코드(AC00)를 확인합니다.

```python
print("int: {0:d};  hex: {0:x};  oct: {0:o};  bin: {0:b}".format(ord('가')))
> int: 44032;  hex: ac00;  oct: 126000;  bin: 1010110000000000
```

다음으로, UTF-8은 위 유니코드 코드를 8비트(UTF-8의 8) 단위로 컴퓨터에 저장하기 위한 인코딩 방법입니다. UTF-8은 한 가지 특징은 가변 인코딩이라는 점인데, 어떤 문자냐에 따라 1바이트로 저장할 수도 있고, 2, 3 혹은 4바이트로 저장할 수도 있습니다. 가변이라는 특징으로 인해, 연속된 문자열 비트 표현의 어디서부터 어디까지가 하나의 문자인지 구별하기 위한 방법이 필요해집니다. 이를 위해 각 문자는 자신이 몇 바이트로 표현되는지를 첫 바이트 부분에 표시해주고 있습니다. 예를 들어 3바이트로 표현되는 경우 첫 바이트는 1110으로 시작하고 나머지 두 바이트는 10으로 시작하도록 약속되어 있습니다. 아래 코드는 "가"를 UTF-8로 인코딩하여 바이트열로 변환한 후, 바이트열이 비트로는 어떻게 표현되는지 확인합니다. "가"의 바이트열이 3바이트이고 UTF-8 인코딩 규칙에 따라 1110으로 시작한다는 것을 알 수 있습니다.

```python
print(bytes('가', encoding='utf-8'))
> b'\xea\xb0\x80'

print(bin(int("eab080",16)))
> 0b111010101011000010000000
```

이제 UTF-8 인코딩 규칙을 참고하여 위 비트에 어떤 정보가 들어 있는지 확인해보면, 결국 유니코드 코드 U+AC00을 의미한다는 것을 알 수 있습니다.

```python
# 첫번째 바이트 11101010 에서 1110 제외한 1010 추출
# 두번째 바이트 10110000 에서 10 제외한 110000 추출
# 세번째 바이트 10000000 에서 10 제외한 000000 추출
print(hex(int("1010"+"110000"+"000000",2))) # 추출한 비트들을 합친 후 헥스로 변환
> 0xac00 # "가"의 유니코드 코드인 U+AC00과 일치
```

#### 파이썬의 입출력 유형

앞서 내용이 좀 길었는데, 이제 드디어 파이썬 입출력을 살펴볼 차례입니다. 파이썬은 사용되는 자료형에 따라 텍스트 입출력, 바이너리 입출력, 원시 입출력 유형을 지원합니다. 텍스트 입출력에는 텍스트 시퀀스가 사용되고, 바이너리 입출력과 원시 입출력에는 바이너리 시퀀스가 사용됩니다. 입출력 대상이 파일, 소켓 혹은 다른 무엇이건 큰 범주는 이 세 가지 유형에 속합니다.

#### 텍스트 입출력

텍스트 입출력은 인코딩, 디코딩, 줄 넘김 문자 처리 등 여러 가지 이유로 인해 바이너리 입출력보다 상당히 느립니다. 아래 코드에서 텍스트 모드 파일 입출력은 파일에 저장되어 있는 비트들을 디코딩하는 과정을 거치고 난 후에야 텍스트 시퀀스를 얻습니다. 텍스트 시퀀스를 사용하는 io.StringIO 객체는 바이너리 스트림만큼 빠른 인 메모리 텍스트 스트림을 제공하며, 실제 파일처럼 취급되는 파일-라이크 객체 역할을 합니다.

```python
f = open("myfile.txt", "r", encoding="utf-8")
f = io.StringIO('I am a file-like object. I am readable, writable...')
f.read()
```

#### 바이너리 입출력

인코딩, 디코딩, 줄 넘김 문자를 처리하지 않는 바이너리 모드 파일 입출력은 텍스트 모드 파일 입출력보다 빠릅니다. 바이너리 시퀀스를 사용하는 io.BytesIO 객체는 인 메모리 바이너리 스트림을 제공하며, 인 메모리 바이트 버퍼를 사용하여 버퍼에 직접 접근하여 값을 읽거나 쓸 수 있습니다.

```python
f = open("myfile.png", "rb")
f = io.BytesIO(b"getbuffer() : get in-memory byte buffer")
f = io.BytesIO(bytes(10))
f = io.BytesIO(bytearray(10))
f.read()
```

#### 원시 입출력

원시 입출력은 버퍼링되지 않은 입출력입니다. 텍스트 입출력과 바이너리 입출력에 비해 자주 사용하지는 않습니다. 혹시 사용할 일이 생기게 되면, 원시 입출력에 대한 고수준의 액세스를 제공하는 io.BufferedReader와 io.BufferedWriter가 도움이 될 것입니다.

```python
f = open("myfile.png", "rb", buffering=0)
```

#### 입출력 클래스 위계

파이썬 io 모듈은 입출력과 관련된 추상 베이스 클래스와 구상 클래스들을 제공합니다. 각 클래스에 대한 상세한 설명은 [공식문서](https://docs.python.org/ko/3/library/io.html)를 참고하세요.

```
IOBase # 최상위 바이트 스트림
                RawIOBase
                BufferedIOBase
                TextIOBase
RawIOBase # 원시 바이너리 스트림
                FileIO
BufferedIOBase # 버퍼링된 바이너리 스트림
                BufferedWriter
                BufferedReader
                BufferedRWPair
                BufferedRandom
                BytesIO
TextIOBase # 텍스트 스트림
                TextIOWrapper
                StringIO
```


#### 입출력 과정에서 본 스트림

이번에는 다양한 입출력을 스트림의 관점에서 살펴보겠습니다. 스트림의 성능을 향상시키는 버퍼의 동작에 대해서는 뒤에서 따로 다루도록 하겠습니다.

표준 입출력 스트림입니다.

```python
data = input() # 표준 입력 스트림에서 텍스트 시퀀스를 받음
print(data) # 표준 출력 스트림으로 텍스트 시퀀스를 보냄

f = open("test.txt","a")
print("a", file=f) # 표준 출력 스트림으로 텍스트 시퀀스를 보냄 (stdout이 파일에 연결?)
```

파일 입출력 스트림입니다.

```python
f = open('textmode.dat', 'w') # (텍스트) 출력 스트림 생성
f.write("some text data"+"\n") # 출력 스트림으로 텍스트 시퀀스를 보냄
f.close() # 출력 스트림 소멸(로 추정)

f = open('textmode.dat','r') # (텍스트) 입력 스트림 생성
data = f.read() # 입력 스트림에서 텍스트 시퀀스를 받음
f.close() # 입력 스트림 소멸

f = open('binarymode.dat', 'wb') # (바이너리) 출력 스트림 생성
f.write('some binary data'.encode()) # 출력 스트림으로 바이너리 시퀀스를 보냄
f.close() # 출력 스트림 소멸

f = open('binarymode.dat','rb') # (바이너리) 입력 스트림 생성
data = f.read() # 입력 스트림에서 바이너리 시퀀스를 받음
f.close() # 입력 스트림 소멸

f = open('rw.dat', 'r+') # (텍스트) 입력 스트림과 출력 스트림 생성
data = f.readline() # 입력 스트림에서 텍스트 시퀀스를 받음
f.write("rw"+"\n") # 출력 스트림으로 텍스트 시퀀스를 보냄
f.close() # 입력 스트림과 출력 스트림 소멸
```

소켓 입출력 스트림입니다.

```python
from socket import socket, AF_INET, SOCK_STREAM
s = socket(AF_INET, SOCK_STREAM)
s.bind(('', 8080)) # (바이너리) 입력 스트림과 출력 스트림 생성
s.listen()
cs, addr = s.accept() # (바이너리) 입력 스트림과 출력 스트림 생성
print(cs.recv(1024).decode('utf-8')) # 입력 스트림에서 바이너리 시퀀스를 받음
cs.send(b'Fine, Thank you. And you?') # 출력 스트림으로 바이너리 시퀀스를 보냄

from socket import socket, AF_INET, SOCK_STREAM
s = socket(AF_INET, SOCK_STREAM)
s.connect(('localhost', 8080)) # (바이너리) 입력 스트림과 출력 스트림 생성
s.send(b'How are you?') # 출력 스트림으로 바이너리 시퀀스를 보냄
print(s.recv(1024).decode('utf-8')) # 입력 스트림에서 바이너리 시퀀스를 받음 
```

In-Memory 입출력 스트림입니다.

```python
import io
output = io.StringIO() # (텍스트) 출력 스트림 생성
output.write('First line.\n') # 출력 스트림으로 텍스트 시퀀스를 보냄
print('Second line.', file=output) # 출력 스트림으로 텍스트 시퀀스를 보냄
print(output.getvalue()) # (버퍼의 값을 출력)
output.close() # 출력 스트림 소멸

import io
b = io.BytesIO() # (바이너리) 출력 스트림 생성
for i in range(100000):
    b.write(b'stream') # 출력 스트림으로 바이너리 시퀀스를 보냄
view = b.getbuffer() # (버퍼에 직접 접근하기 위한 뷰)
view[-3:] = b'ing' # (버퍼의 값을 변경)
del view # (뷰 소멸)
b.write(b'...') # 출력 스트림으로 바이너리 시퀀스를 보냄
print(b.getvalue()) # (버퍼의 값을 출력)
b.close() # 출력 스트림 소멸
```

### 버퍼와 플러시

#### 버퍼

스트림의 성능을 향상시키는 버퍼에 대해 알아봅시다. 버퍼는 입출력 하드웨어 작업을 최소화하도록 도와 CPU와 입출력 장치의 처리 속도 차이에서 발생하는 비효율성을 극복하는 역할을 하며, 주기억장치(RAM)의 일부에 자리잡고 있습니다. 운영체제는 버퍼를 사용하여 일정량의 데이터를 모으고, 모은 데이터에 대해 한꺼번에 입출력 작업을 수행합니다.

버퍼의 존재를 확인해봅시다. 프로그램 코드에서 read(), write() 혹은 send(), recv() 등을 실행할 때, 그 즉시 입출력이 발생하는 것이 아닙니다. 일단은 스트림의 버퍼에 데이터를 보내거나 읽어오는 과정이 먼저 수행됩니다. 1초마다 write()를 실행하여 1024바이트의 바이너리 시퀀스를 출력 스트림으로 보내는 코드를 실행하여 버퍼의 동작을 직접 확인해보겠습니다.

```python
import time
chunksize = 1024
f = open("buffer.buf","wb")
for i in range(20):
    print((i+1)*chunksize)
    f.write(b"." * (chunksize - 1) + b'\n')
    # f.flush()
    time.sleep(1)
f.close()
```

위 코드를 실행하고 py.txt 파일을 계속 새로고침 해보면, 계속 빈 파일을 유지하다가 9초가 되는 순간 8192바이트의 데이터를 갖는 파일로 바뀌는 것을 확인할 수 있습니다. 9초 시점에 파일 쓰기 동작이 처음 실행된 것을 의미합니다. 버퍼의 크기가 8192바이트라는 것을 추측해볼 수 있는데, 이는 아래 코드로 확인한 값과 일치합니다.

```python
import io
print(io.DEFAULT_BUFFER_SIZE, "바이트") # 8192 바이트
```

스트림은 자신만의 버퍼를 가질 수 있습니다. 바이너리 출력 스트림의 경우 버퍼의 크기를 제각각 다르게 할 수도 있습니다. 참고로 텍스트 출력 스트림의 경우 buffering=1을 설정하여 라인 버퍼링을 할 수 있습니다.

```python
import time
chunksize = 1024
f1 = open("buffer.4096","wb",buffering=4096) # 이 출력 스트림의 버퍼 크기는 4096 바이트
f2 = open("buffer.8192","wb",buffering=8192) # 이 출력 스트림의 버퍼 크기는 8192 바이트
for i in range(20):
    print((i+1)*chunksize)
    f1.write(b"." * (chunksize - 1) + b'\n')
    f2.write(b"." * (chunksize - 1) + b'\n')
    time.sleep(1)
f1.close()
f2.close()
```

위 코드에서는 두 바이너리 출력 스트림의 버퍼 크기를 각각 4096 바이트와 8192 바이트로 변경하고 있습니다. buffer.4096 파일은 4초 주기로, buffer.8192 파일은 8초 주기로 파일 내용이 갱신되는 것을 볼 수 있습니다. 마찬가지로 버퍼가 모두 차야 디스크 작업이 발생한 것도 확인할 수 있습니다. 이처럼 파일의 경우, 버퍼에 텍스트 시퀀스나 바이너리 시퀀스를 일정량 채운 다음 한꺼번에 디스크에 기록하고 있습니다. 소켓의 경우도 마찬가지일 것입니다.

#### 플러시

저 위 코드에는 f.flush()라는 부분이 주석처리 되어있는 것을 볼 수 있습니다. f.flush() 주석을 해제하면, 플러시에 의해 매 초마다 파일에 쓰기 동작이 발생하며 파일 크기가 증가하는 것을 확인할 수 있습니다. 버퍼가 다 차지 않았더라도 출력 스트림으로 내보내는 동작이 이루어지고 있음을 의미합니다. 참고로 파이썬 파일 입출력의 경우 디스크 쓰기에 관한 동작은 다음과 같습니다. 1) flush() 또는 close()가 실행되면 디스크 쓰기 동작이 이루어집니다. 2) 텍스트 출력 스트림의 라인 버퍼링이 설정된 경우 각 라인마다 디스크 쓰기 동작이 이루어집니다. 3) 그 외의 경우, 청크가 버퍼로 전달될 때, 버퍼에 자리가 없고 청크가 버퍼 크기보다 작으면, 버퍼 안의 데이터에 대한 디스크 쓰기 동작이 이루어지고, 해당 청크는 버퍼에 자리하게 됩니다. 청크가 버퍼로 전달될 때, 버퍼에 자리가 없고 청크가 버퍼 크기보다 크면, 버퍼 안의 데이터와 청크에 대한 디스크 쓰기 동작이 이루어집니다. 아래 코드는 버퍼 크기를 10바이트로 고정시킨 후 다양한 청크를 전달하여 버퍼의 동작을 관찰합니다.

```python
import time
import os

start = time.time()
def write(stream, chunk):
    stream.write(chunk)
    end = time.time()
    time.sleep(1)
    print((end - start) // 1, chunk, os.path.getsize('buffer.10'))

with open('buffer.10', "wb", buffering=10) as f:
    write(f, b"12345");
    write(f, b"12345");
    write(f, b"1");
    write(f, b"1");
    write(f, b"12345678901234567890");
    write(f, b"1");
    write(f, b"12345");
    write(f, b"12345");
    write(f, b"1");
    write(f, b"1");
    write(f, b"12345678901234567890");
    write(f, b"1");
```

```
경과시간, 청크, 파일크기
-------------------------------
0.0 b'12345' 0
1.0 b'12345' 0
2.0 b'1' 10
3.0 b'1' 10
4.0 b'12345678901234567890' 32
5.0 b'1' 32
6.0 b'12345' 32
7.0 b'12345' 38
8.0 b'1' 38
9.0 b'1' 38
10.0 b'12345678901234567890' 65
11.0 b'1' 65

# 실제 파일 내용
          |--------||--------||--------||--------||--------||--------||--------|
1초 경과   비어있음
2초 경과   1234512345
4초 경과   12345123451112345678901234567890
7초 경과   12345123451112345678901234567890112345
10초 경과  12345123451112345678901234567890112345123451112345678901234567890
실행 종료  123451234511123456789012345678901123451234511123456789012345678901
```

#### 버퍼 성능 비교

이번에는 버퍼의 성능을 체험해보겠습니다. 아래 코드는 총 1MB 분량의 바이너리 시퀀스 출력에 대한 소요시간을 기록합니다. 버퍼를 사용했을 때, 버퍼를 사용하지 않았을 때, 버퍼에 플러시를 사용했을 때, in-memory 버퍼를 사용했을 때 등 여러 가지 경우에 대한 소요 시간을 비교해봅니다.

```python
import io
import time
laptimes = [time.time()]

def laptime(title):
    laptimes.append(time.time())
    print(title, '-', str(laptimes[-1] - laptimes[-2]))

for chunksize in [8192,1024,128]: # 전체 데이터 조각의 개수
    chunkcount = (1024 * 1024) // chunksize # 스트림에 전달되는 데이터 조각의 크기
    chunk = b"." * (chunksize - 1) + b'\n' # 데이터 조각의 내용
    print('\nchunksize', '-', chunksize)
    print('chunkcount', '-', chunkcount)

    with open("case.1","wb") as f:
        for i in range(chunkcount):
            f.write(chunk)
    laptime('case.1_buffer')    

    with open("case.2","wb", buffering=0) as f:
        for i in range(chunkcount):
            f.write(chunk)
    laptime('case.2_no buffer')    

    with open("case.3","wb") as f:
        for i in range(chunkcount):
            f.write(chunk)
            f.flush()
    laptime('case.3_buffer, flush')

    with open("case.4","wb", buffering=0) as f:
        with io.BufferedWriter(f) as b:
            for i in range(chunkcount):
                b.write(chunk)
    laptime('case.4_no buffer, BufferedWriter')

    with io.BytesIO() as b:
        for i in range(chunkcount):
            b.write(chunk)
        with open("case.5","wb") as f:
            f.write(b.getvalue())
    laptime('case.5_in-memory')

    with io.BytesIO() as b:
        for i in range(chunkcount):
            b.write(chunk)
            b.flush()
        with open("case.6","wb") as f:
            f.write(b.getvalue())
    laptime('case.6_in-memory, flush')
```

```
chunksize - 8192
chunkcount - 128
case.1_buffer - 0.010993480682373047
case.2_no buffer - 0.010993719100952148
case.3_buffer, flush - 0.009994268417358398
case.4_no buffer, BufferedWriter - 0.010993480682373047
case.5_in-memory - 0.0049991607666015625
case.6_in-memory, flush - 0.003997087478637695

chunksize - 1024
chunkcount - 1024
case.1_buffer - 0.011991739273071289
case.2_no buffer - 0.06296420097351074
case.3_buffer, flush - 0.06496214866638184
case.4_no buffer, BufferedWriter - 0.010994195938110352
case.5_in-memory - 0.003999471664428711
case.6_in-memory, flush - 0.0039958953857421875

chunksize - 128
chunkcount - 8192
case.1_buffer - 0.014991283416748047
case.2_no buffer - 0.4976656436920166
case.3_buffer, flush - 0.5457770824432373
case.4_no buffer, BufferedWriter - 0.013981819152832031
case.5_in-memory - 0.006996870040893555
case.6_in-memory, flush - 0.00699615478515625
```

case.1과 case.2를 비교하면 chunksize가 작아질수록 버퍼로 인한 성능 향상이 커지는 것을 알 수 있습니다. 다시말해, 버퍼를 사용하지 않은 경우에는 디스크 접근 횟수가 늘어나고 이에 따른 병목 현상도 자주 발생하지만, 버퍼를 사용한 경우에는 디스크 접근 횟수가 상대적으로 적어 병목 현상 역시 덜 발생하는 것입니다. case.2(버퍼를 사용하지 않음)와 case.3(매 write() 동작마다 flush()를 수행)의 결과가 대체로 비슷함을 알 수 있습니다. case.4와 같이 버퍼가 없는 출력에도 BufferedWriter를 사용하여 버퍼를 제공할 수 있음을 알 수 있습니다. case.1과 case.5을 비교하면 파일 입출력에서 여러 번의 write() 보다는 in-memory 버퍼를 사용한 한 번의 write()가 훨씬 빠르다는 것을 알 수 있습니다. case.5와 6을 비교하면 in-memory 버퍼는 flush()의 영향을 크게 받지 않는 것도 알 수 있습니다.

### 참고

- 입출력
  - [입출력 - 위키백과](https://ko.wikipedia.org/wiki/%EC%9E%85%EC%B6%9C%EB%A0%A5)
  - [입출력의 이해](http://contents2.kocw.or.kr/KOCW/data/edu/document/cuk/songhyunjoo1206/12.pdf)
  - [입출력 장치](https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/36_file-devices.pdf)
- 스트림
  - [스트림 - 한글위키](https://ko.wikipedia.org/wiki/%EC%8A%A4%ED%8A%B8%EB%A6%BC_(%EC%BB%B4%ED%93%A8%ED%8C%85))
  - [스트림 - TCPSCHOOL](http://tcpschool.com/java/java_io_stream)
  - [스트림 - 출력스트림](https://sangwoo0727.github.io/network/Network-stream/)
  - [Stream이란? - 기본 개념과 특징](https://steady-coding.tistory.com/309)
  - [[C언어]스트림의 의미](https://billnairk.tistory.com/74)
  - [파일입출력 - 스트림에 대한 이해](https://jhnyang.tistory.com/196)
  - [[OS] 스트림과 표준스트림](https://dana-study-log.tistory.com/entry/OS-%EC%8A%A4%ED%8A%B8%EB%A6%BC%EA%B3%BC-%ED%91%9C%EC%A4%80%EC%8A%A4%ED%8A%B8%EB%A6%BC)
  - [스트림과 버퍼 - TCPSCHOOL](https://tcpschool.com/cpp/cpp_io_streamBuffer)
  - [입출력 함수들을 이해하기 전에 버퍼와 스트림을 간단하게 알아봅시다.](https://codingdog.tistory.com/entry/입출력-함수들을-이해하기-전에-버퍼와-스트림을-간단하게-알아봅시다)
  - [함수와 표준 I/O](https://brunch.co.kr/@sinclairo/12)
  - [청크, 버퍼, 스트림](https://darrengwon.tistory.com/126)
  - [chunk, buffer, stream](https://velog.io/@jing07161/chunk-buffer-stream)
- 표준 입출력 (스트림)
  - [표준 스트림 - 한글위키](https://ko.wikipedia.org/wiki/%ED%91%9C%EC%A4%80_%EC%8A%A4%ED%8A%B8%EB%A6%BC)
  - [표준 스트림, 표준 입출력에 대해 알아보자](https://shoark7.github.io/programming/knowledge/what-is-standard-stream)
  - [(C언어) 33 - 스트림](https://dogrushdev.tistory.com/35)
  - [데이터를 입력받는 방법을 유연하게 생각해보기](https://soooprmx.com/standard-input-and-output-in-python/)
  - [Python 표준 입출력(stdin/stdout) 활용 - 리눅스 프로그램과 연동](https://kibua20.tistory.com/71)
- 파이썬 입출력
  - [IO - 스트림 작업을 위한 핵심 도구](https://docs.python.org/ko/3/library/io.html)
  - [텍스트 시퀀스 형](https://docs.python.org/ko/3/library/stdtypes.html#text-sequence-type-str), [EN](https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str)
  - [바이너리 시퀀스 형](https://docs.python.org/ko/3/library/stdtypes.html#binary-sequence-types-bytes-bytearray-memoryview), [EN](https://docs.python.org/3/library/stdtypes.html#binary-sequence-types-bytes-bytearray-memoryview)
  - [바이너리 데이터 서비스](https://docs.python.org/ko/3.10/library/binary.html)
  - [인코딩과 유니코드](https://docs.python.org/ko/3.10/library/codecs.html#encodings-and-unicode), [EN](https://docs.python.org/3.10/library/codecs.html#encodings-and-unicode)
  - [문자열 인코딩 완벽 정복하기](https://redisle.tistory.com/14)
  - [Unicode와 UTF-8 간단히 이해하기](https://jeongdowon.medium.com/unicode%EC%99%80-utf-8-%EA%B0%84%EB%8B%A8%ED%9E%88-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-b6aa3f7edf96)
  - [파이썬 한글 인코딩 탐구](https://redscreen.tistory.com/163)
  - [입력과 출력](https://docs.python.org/ko/3/tutorial/inputoutput.html)
  - [Python io – BytesIO, StringIO](https://www.journaldev.com/19178/python-io-bytesio-stringio)
  - [io.stringio vs open](https://stackoverflow.com/questions/50418448/io-stringio-vs-open-in-python-3)
  - [파이썬 파일 입출력 정리](https://soooprmx.com/%ed%8c%8c%ec%9d%b4%ec%8d%ac%ec%9d%98-%ed%8c%8c%ec%9d%bc%ec%9e%85%ec%b6%9c%eb%a0%a5-%ec%a0%95%eb%a6%ac/)
  - [파일 입출력2](https://eskeptor.tistory.com/77)
- 버퍼와 플러시
  - [버퍼란? 버퍼 개념](https://dololak.tistory.com/84)
  - [내장 함수 - open](https://docs.python.org/ko/3/library/functions.html?#open)
  - [Understand the Buffer Policy in Python](https://medium.com/@bramblexu/understand-the-buffer-policy-in-python-78e91e7759ca)
- 기타
  - [통신에 필요한 개념 정리](https://m.blog.naver.com/ginameee/220839976258)
  - [입출력 스트림의 분리](https://niklasjang.github.io/rtmp/rtmp-5/)
