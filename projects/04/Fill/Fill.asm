// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, 
// the screen should be cleared.

/* pseudo

n = 8192

LOOP:
    if KBD != 0 goto FILL
    addr = SCREEN
    i = 0
    
    LOOP_CLEAR:
        if i >= n goto END_CLEAR
        RAM[addr] = 0
        addr = addr + 1
        i = i + 1
        goto LOOP_CLEAR

    END_CLEAR:
        goto LOOP

    FILL:
        addr = SCREEN
        i = 0
        
        LOOP_FILL:
            if i >= n goto END_FILL
            RAM[addr] = -1
            addr = addr + 1
            i = i + 1
            goto LOOP_FILL

        END_FILL:
            goto LOOP    
*/

@8192
D=A
@n
M=D                     // n = 8192

(LOOP)
    @KBD
    D=M
    @FILL
    D;JNE               // if KBD != 0 goto FILL

    @SCREEN
    D=A
    @addr
    M=D                 // addr = SCREEN
    @i
    M=0                 // i = 0

    (LOOP_CLEAR)
        @i
        D=M
        @n
        D=D-M
        @END_CLEAR
        D;JGE           // if i >= n goto END_CLEAR

        @addr
        A=M
        M=0             // RAM[addr] = 0
        @addr
        M=M+1           // addr = addr + 1
        @i
        M=M+1           // i = i + 1
        @LOOP_CLEAR
        0;JMP           // goto LOOP_CLEAR

    (END_CLEAR)
        @LOOP
        0;JMP

    (FILL)
    
        @SCREEN
        D=A
        @addr
        M=D                 // addr = SCREEN
        @i
        M=0                 // i = 0

        (LOOP_FILL)
            @i
            D=M
            @n
            D=D-M
            @END_FILL
            D;JGE           // if i >= n goto END_FILL

            @addr
            A=M
            M=-1            // RAM[addr] = -1
            @addr
            M=M+1           // addr = addr + 1
            @i
            M=M+1           // i = i + 1
            @LOOP_FILL
            0;JMP           // goto LOOP_FILL

        (END_FILL)
            @LOOP
            0;JMP    


















