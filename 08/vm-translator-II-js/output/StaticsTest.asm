// bootstrap code
@256
D=A
@SP
M=D

// call Sys.init 0
@Bootstrap.Sys.init.$ret.1
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=M
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Sys.init
0;JMP
(Bootstrap.Sys.init.$ret.1)

// function Class1.set 0
(Class1.set)

// push argument 0
@ARG
D=M
@0
D=D+A
@addr
M=D
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1

// pop static 0
@SP
AM=M-1
D=M
@Class1.vm.0
M=D

// push argument 1
@ARG
D=M
@1
D=D+A
@addr
M=D
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1

// pop static 1
@SP
AM=M-1
D=M
@Class1.vm.1
M=D

// push constant 0
@0
D=A
@SP
A=M
M=D
@SP
M=M+1

// return
@LCL
D=M
@5
A=D-A
D=M
@R13
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M+1
@SP
M=D
@LCL
D=M
@1
A=D-A
D=M
@THAT
M=D
@LCL
D=M
@2
A=D-A
D=M
@THIS
M=D
@LCL
D=M
@3
A=D-A
D=M
@ARG
M=D
@LCL
D=M
@4
A=D-A
D=M
@LCL
M=D
@R13
A=M
0;JMP

// function Class1.get 0
(Class1.get)

// push static 0
@Class1.vm.0
D=M
@SP
A=M
M=D
@SP
M=M+1

// push static 1
@Class1.vm.1
D=M
@SP
A=M
M=D
@SP
M=M+1

// sub
@SP
AM=M-1
D=M
A=A-1
M=M-D

// return
@LCL
D=M
@5
A=D-A
D=M
@R13
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M+1
@SP
M=D
@LCL
D=M
@1
A=D-A
D=M
@THAT
M=D
@LCL
D=M
@2
A=D-A
D=M
@THIS
M=D
@LCL
D=M
@3
A=D-A
D=M
@ARG
M=D
@LCL
D=M
@4
A=D-A
D=M
@LCL
M=D
@R13
A=M
0;JMP

// function Class2.set 0
(Class2.set)

// push argument 0
@ARG
D=M
@0
D=D+A
@addr
M=D
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1

// pop static 0
@SP
AM=M-1
D=M
@Class2.vm.0
M=D

// push argument 1
@ARG
D=M
@1
D=D+A
@addr
M=D
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1

// pop static 1
@SP
AM=M-1
D=M
@Class2.vm.1
M=D

// push constant 0
@0
D=A
@SP
A=M
M=D
@SP
M=M+1

// return
@LCL
D=M
@5
A=D-A
D=M
@R13
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M+1
@SP
M=D
@LCL
D=M
@1
A=D-A
D=M
@THAT
M=D
@LCL
D=M
@2
A=D-A
D=M
@THIS
M=D
@LCL
D=M
@3
A=D-A
D=M
@ARG
M=D
@LCL
D=M
@4
A=D-A
D=M
@LCL
M=D
@R13
A=M
0;JMP

// function Class2.get 0
(Class2.get)

// push static 0
@Class2.vm.0
D=M
@SP
A=M
M=D
@SP
M=M+1

// push static 1
@Class2.vm.1
D=M
@SP
A=M
M=D
@SP
M=M+1

// sub
@SP
AM=M-1
D=M
A=A-1
M=M-D

// return
@LCL
D=M
@5
A=D-A
D=M
@R13
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M+1
@SP
M=D
@LCL
D=M
@1
A=D-A
D=M
@THAT
M=D
@LCL
D=M
@2
A=D-A
D=M
@THIS
M=D
@LCL
D=M
@3
A=D-A
D=M
@ARG
M=D
@LCL
D=M
@4
A=D-A
D=M
@LCL
M=D
@R13
A=M
0;JMP

// function Sys.init 0
(Sys.init)

// push constant 6
@6
D=A
@SP
A=M
M=D
@SP
M=M+1

// push constant 8
@8
D=A
@SP
A=M
M=D
@SP
M=M+1

// call Class1.set 2
@Sys.vm.Class1.set.$ret.1
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=M
@7
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class1.set
0;JMP
(Sys.vm.Class1.set.$ret.1)

// pop temp 0
@5
D=A
@0
D=D+A
@addr
M=D
@SP
AM=M-1
D=M
@addr
A=M
M=D

// push constant 23
@23
D=A
@SP
A=M
M=D
@SP
M=M+1

// push constant 15
@15
D=A
@SP
A=M
M=D
@SP
M=M+1

// call Class2.set 2
@Sys.vm.Class2.set.$ret.2
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=M
@7
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class2.set
0;JMP
(Sys.vm.Class2.set.$ret.2)

// pop temp 0
@5
D=A
@0
D=D+A
@addr
M=D
@SP
AM=M-1
D=M
@addr
A=M
M=D

// call Class1.get 0
@Sys.vm.Class1.get.$ret.3
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=M
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class1.get
0;JMP
(Sys.vm.Class1.get.$ret.3)

// call Class2.get 0
@Sys.vm.Class2.get.$ret.4
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=M
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class2.get
0;JMP
(Sys.vm.Class2.get.$ret.4)

// label END
(END)

// goto END
@END
0;JMP

