// 這是 NestJS 提供的核心裝飾器與參數注入器，屬於框架基本功能
// Controller: 控制器裝飾器，用來定義路由
// Get, Post: 路由裝飾器，用來定義 HTTP 方法
// Req, Res: HTTP 請求與回應物件裝飾器，用來獲取 HTTP 請求與回應
// Body: 用來獲取請求體中的資料
import { Controller, Get, Post, Req, Res, Body } from '@nestjs/common';

// 這是直接從 Express 套件匯入的類型（TypeScript 型別），不是 Nest 提供的
// 但 Nest 是建構在 Express（或 Fastify）之上的，所以可以直接用。
import { Response, Request } from 'express';

// 這是用來定義 Swagger API 文件的裝飾器
import { ApiBody } from '@nestjs/swagger';

// 這是 NestJS 的裝飾器，用來定義控制器
@Controller('cookie')
// 這是控制器的類別，負責處理與 Cookie 相關的請求
export class CookieController {
  // 這是用來處理設定 Cookie 的 POST 請求
  @Post('setCookie')
  // @Body('value') 用來獲取請求體中的 'value' 欄位
  // @Res() 用來獲取 Express 的 Response 物件
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { type: 'string', example: 'hello-cookie' },
      },
    },
  })
  setCookie(@Body('value') value: string, @Res() res: Response) {
    // 假設這裡設定了一個名為 'test_cookie' 的 cookie，設定 Cookie 的有效期為 10 秒
    res.cookie('test_cookie', value, {
      maxAge: 10 * 1000,
      path: '/',
      sameSite: 'none', // 允許跨站
      secure: true, // SameSite:none 必須搭配
      httpOnly: true,
    });
    // 回傳一個 JSON 物件，表示 Cookie 已經設定成功
    res.json({ message: 'Cookie 已設定', cookie: value });
  }

  // 這是用來處理查看 Cookie 的 GET 請求

  @Get('seeCookie')
  // @Req() 用來獲取 Express 的 Request 物件
  seeCookie(@Req() req: Request, @Res() res: Response) {
    // 假設這裡從請求中獲取 cookie
    const cookieValue = req.cookies['test_cookie'];
    // 回傳一個 JSON 物件，包含 cookie 的值
    res.json({ message: `Cookie 是這個：${JSON.stringify(cookieValue)}` });
  }

  // 新增：證明 Cookie 可以被使用 (通常是後端驗證或讀取)
  @Get('useCookie')
  useCookie(@Req() req: Request) {
    const authToken = req.cookies?.['test_cookie']; // 加上安全取值

    if (authToken) {
      return {
        message: 'Cookie "test_cookie" 已被成功使用！',
        value: authToken,
        status: '已驗證',
      };
    } else {
      return {
        message: '找不到 Cookie "test_cookie"，請確認是否已設定。',
        status: '未驗證',
      };
    }
  }

  // 這是用來處理刪除 Cookie 的 POST 請求
  @Post('dropCookie')
  // @Res() 用來獲取 Express 的 Response 物件
  dropCookie(@Res() res: Response) {
    res.cookie('test_cookie', '', {
      maxAge: 0,
      path: '/',
      sameSite: 'none', // 允許跨站
      secure: true, // SameSite:none 必須搭配
      httpOnly: true,
    });
    // 回傳一個 JSON 物件，表示 Cookie 已經刪除
    res.json({ message: 'Cookie 已刪除' });
  }
}

@Controller('session')
export class SessionController {
  @Post('setSession')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { type: 'string', example: 'hello-session' },
      },
    },
  })
  setSession(@Req() req: Request, @Body('value') value: string) {
    req.session['test_data'] = value;
    return { message: 'Session 已設定', value };
  }

  @Get('seeSession')
  seeSession(@Req() req: Request) {
    const sessionData = req.session['test_data'];
    return { message: '目前的 Session 資料', sessionData };
  }

  @Get('useSession')
  useSession(@Req() req: Request) {
    const data = req.session['test_data'];
    if (data) {
      return { message: 'Session 有效', value: data };
    } else {
      return { message: 'Session 不存在或已過期' };
    }
  }

  @Post('dropSession')
  dropSession(@Req() req: Request) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session 刪除失敗', err);
      }
    });
    return { message: 'Session 已清除' };
  }
}
