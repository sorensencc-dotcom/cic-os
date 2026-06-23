
<nav class="active-link-list py-m flex-container-row justify-center wrap">
    <?php if(userCan(\BookStack\Permissions\Permission::SettingsManage)): ?>
        <a href="<?php echo e(url('/settings')); ?>" <?php if($selected == 'settings'): ?> class="active" <?php endif; ?>><?php echo (new \BookStack\Util\SvgIcon('settings'))->toHtml(); ?><?php echo e(trans('settings.settings')); ?></a>
        <a href="<?php echo e(url('/settings/maintenance')); ?>" <?php if($selected == 'maintenance'): ?> class="active" <?php endif; ?>><?php echo (new \BookStack\Util\SvgIcon('spanner'))->toHtml(); ?><?php echo e(trans('settings.maint')); ?></a>
    <?php endif; ?>
    <?php if(userCan(\BookStack\Permissions\Permission::SettingsManage) && userCan(\BookStack\Permissions\Permission::UsersManage)): ?>
        <a href="<?php echo e(url('/settings/audit')); ?>" <?php if($selected == 'audit'): ?> class="active" <?php endif; ?>><?php echo (new \BookStack\Util\SvgIcon('open-book'))->toHtml(); ?><?php echo e(trans('settings.audit')); ?></a>
    <?php endif; ?>
    <?php if(userCan(\BookStack\Permissions\Permission::UsersManage)): ?>
        <a href="<?php echo e(url('/settings/users')); ?>" <?php if($selected == 'users'): ?> class="active" <?php endif; ?>><?php echo (new \BookStack\Util\SvgIcon('users'))->toHtml(); ?><?php echo e(trans('settings.users')); ?></a>
    <?php endif; ?>
    <?php if(userCan(\BookStack\Permissions\Permission::UserRolesManage)): ?>
        <a href="<?php echo e(url('/settings/roles')); ?>" <?php if($selected == 'roles'): ?> class="active" <?php endif; ?>><?php echo (new \BookStack\Util\SvgIcon('lock-open'))->toHtml(); ?><?php echo e(trans('settings.roles')); ?></a>
    <?php endif; ?>
    <?php if(userCan(\BookStack\Permissions\Permission::SettingsManage)): ?>
        <a href="<?php echo e(url('/settings/webhooks')); ?>" <?php if($selected == 'webhooks'): ?> class="active" <?php endif; ?>><?php echo (new \BookStack\Util\SvgIcon('webhooks'))->toHtml(); ?><?php echo e(trans('settings.webhooks')); ?></a>
    <?php endif; ?>
</nav><?php /**PATH /app/www/resources/views/settings/parts/navbar.blade.php ENDPATH**/ ?>