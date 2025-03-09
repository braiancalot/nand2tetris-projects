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

// function Main.fibonacci 0
(Main.fibonacci)

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

// push constant 2
@2
D=A
@SP
A=M
M=D
@SP
M=M+1

// lt
@SP
AM=M-1
D=M
A=A-1
D=M-D
M=-1
@LT_1
D;JLT
@SP
A=M-1
M=0
(LT_1)

// if-goto N_LT_2
@SP
AM=M-1
D=M
@N_LT_2
D;JNE

// goto N_GE_2
@N_GE_2
0;JMP

// label N_LT_2
(N_LT_2)

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

// label N_GE_2
(N_GE_2)

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

// push constant 2
@2
D=A
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

// call Main.fibonacci 1
@Main.vm.Main.fibonacci.$ret.1
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
@6
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Main.fibonacci
0;JMP
(Main.vm.Main.fibonacci.$ret.1)

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

// push constant 1
@1
D=A
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

// call Main.fibonacci 1
@Main.vm.Main.fibonacci.$ret.2
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
@6
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Main.fibonacci
0;JMP
(Main.vm.Main.fibonacci.$ret.2)

// add
@SP
AM=M-1
D=M
A=A-1
M=D+M

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

// push constant 4
@4
D=A
@SP
A=M
M=D
@SP
M=M+1

// call Main.fibonacci 1
@Sys.vm.Main.fibonacci.$ret.1
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
@6
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Main.fibonacci
0;JMP
(Sys.vm.Main.fibonacci.$ret.1)

// label END
(END)

// goto END
@END
0;JMP

