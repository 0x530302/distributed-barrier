# distributed barrier
A simple synchronization helper that allows a set of distributed hosts to all wait for each other using netcat.
Can for example be used to synchronize distributed running shell scripts.

## Install
```
$ git clone https://github.com/0x530302/distributed-barrier.git
$ cd distributed-barrier
$ npm install --global
```

## Usage
***Host A:***
```
$ distributed-barrier token1 token2
```

***Host B:***
```
$ echo token1 | netcat host-a 8413
```

***Host C:***
```
$ echo token2 | netcat host-a 8413
```

All three processes should exit at roughly the same time.

## License
MIT
