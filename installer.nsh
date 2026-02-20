; NSIS 安装脚本 - 用户模式和管理员模式安装支持
; 此脚本用于配置安装程序的权限和行为

; 引入必要的头文件
!include "LogicLib.nsh"
!include "FileFunc.nsh"

; 定义产品名称常量（与 package.json 中的 productName 保持一致）
!define PRODUCT_NAME "Bili-Electron"

; 初始化函数 - 在安装程序启动时执行
Function .onInit
  ; 检测当前用户权限类型
  UserInfo::GetAccountType
  Pop $0
  
  ; 检查命令行参数，判断是否请求管理员安装
  ${GetParameters} $R0
  ClearErrors
  ${GetOptions} $R0 "/ALLUSERS" $R1
  
  ; 如果指定了 /ALLUSERS 参数
  IfErrors 0 check_admin
    ; 没有 /ALLUSERS 参数，使用用户模式安装
    StrCpy $INSTDIR "$LOCALAPPDATA\${PRODUCT_NAME}"
    SetShellVarContext current
    Goto init_done
    
  check_admin:
    ; 有 /ALLUSERS 参数，检查是否有管理员权限
    StrCmp $0 "Admin" 0 no_admin
      ; 管理员权限安装 - 安装到 Program Files
      StrCpy $INSTDIR "$PROGRAMFILES64\${PRODUCT_NAME}"
      SetShellVarContext all
      Goto init_done
      
  no_admin:
    ; 没有管理员权限但请求了 /ALLUSERS，提示用户
    MessageBox MB_OK|MB_ICONEXCLAMATION "您选择了为所有用户安装，但需要管理员权限。$
$
请以管理员身份运行安装程序，或选择仅为当前用户安装。"
    Abort
    
  init_done:
FunctionEnd

; 卸载程序初始化
Function un.onInit
  ; 读取安装时的上下文设置
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "InstallLocation"
  StrCmp $0 "" 0 set_all_context
    ; HKLM 中没有找到，尝试 HKCU（用户安装）
    ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "InstallLocation"
    SetShellVarContext current
    Goto un_init_done
    
  set_all_context:
    SetShellVarContext all
    
  un_init_done:
FunctionEnd
