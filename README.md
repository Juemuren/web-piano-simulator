# 钢琴模拟器

## 原理

> 详细的原理可阅读我的科普文章[《音乐的数学原理：从振动弦到现代乐理》](https://juemuren.github.io/MyBlogs/posts/math/%E9%9F%B3%E4%B9%90%E7%9A%84%E6%95%B0%E5%AD%A6%E5%8E%9F%E7%90%86/)

简单地说，琴弦振动发出的声音，在理想情况下是由一系列谐波组成的，其中基波的频率最低为 $f_1$，而其余谐波的频率都是基频的整数倍：频率为 $nf_1$ 的波叫做 $n$ 次谐波。

本钢琴模拟器就是通过这种方式合成钢琴声的

$$p(t) = \sum_{n=1}^{N}A_n\sin(2\pi n f_1 t)$$

这里只选取了 $N=10$ 个谐波。而 $A_n$ 则是各谐波的振幅，其决定了钢琴的音色。

而音高由各琴键的 $f_1$ 决定。标准音 $A4$ 的基频为 $440Hz$，其它音阶的基频由此通过十二平均律得到，比如 $A4$ 后 $3$ 个音 $C5$ 的基频为 $440 \times 2^{3/12} Hz$。

### 音色预设

| 音色 | 谐波振幅关系                                     | 参数                       |
| ---- | ------------------------------------------------ | -------------------------- |
| 金属 | $A_n \propto \frac1n$                            | 无                         |
| 纯净 | $A_n \propto \frac1{n^2}$                        | 无                         |
| 明亮 | $A_n \propto \frac1n \|\sin\frac{n\pi}2\|$       | 无                         |
| 空灵 | $A_n \propto \frac{1}{n^2} \|\sin\frac{n\pi}2\|$ | 无                         |
| 柔和 | $A_n \propto e^{-\sigma n}$                      | 衰减率 $\sigma$            |
| 常规 | $A_n \propto \frac1{n^2} \sin(n\pi \lambda)$     | 击弦点 $\lambda$           |
| 真实 | $A_n \propto \frac1{n^p} e^{-\sigma n}$          | 幂指数 $p$ 衰减率 $\sigma$ |

### 传递函数预设

纯延时、单回声、多回声和全通都有清晰的时域解释

| 效果   | 时域解释                                            | 传递函数                                                        | 幅频特性                                                | 相频特性                                                                            |
| ------ | --------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 纯延时 | $y(t) = x(t - \tau)$                                | $e^{-j\omega\tau}$                                              | $1$                                                     | $-2\pi \tau f$                                                                      |
| 单回声 | $y(t) = x(t) + \alpha x(t-\tau)$                    | $1 + \alpha e^{-j\omega\tau}$                                   | $\sqrt{1 + \alpha^2 + 2\alpha\cos(2\pi\tau f)}$         | $-\arctan(\frac{\alpha\sin(2\pi\tau f)}{1 + \alpha\cos(2\pi\tau f)})$               |
| 多回声 | $y(t) = \sum_{k=0}^{\infty} \alpha^k x(t - k\tau)$  | $\sum_{k=0}^{\infty} \left( \alpha e^{-j\omega \tau} \right)^k$ | $\frac1{\sqrt{1 + \alpha^2 - 2\alpha\cos(2\pi\tau f)}}$ | $-\arctan(\frac{\alpha\sin(2\pi\tau f)}{1 - \alpha\cos(2\pi\tau f)})$               |
| 全通   | $y(t) = \alpha x(t) + x(t-\tau) - \alpha y(t-\tau)$ | $\frac{\alpha + e^{-j\omega\tau}}{1 + \alpha e^{-j\omega\tau}}$ | $1$                                                     | $-2\pi\tau f - 2\arctan(\frac{\alpha\sin(2\pi\tau f)}{1 - \alpha\cos(2\pi\tau f)})$ |

其中 $\tau$ 为延迟时间，而 $\alpha$ 为衰减系数

理想低通和理想高通的幅频特性和相频特性不需要通过时域解释进行推导

| 效果 | 幅频特性      | 相频特性 |
| ---- | ------------- | -------- |
| 低通 | $[f \le f_c]$ | $0$      |
| 高通 | $[f \ge f_c]$ | $0$      |

其中 $f_c$ 为频率阈值

## 技术栈

本项目用到的主要开源工具有

- React
- TypeScript
- Vite
- Tailwind CSS
- abcjs
