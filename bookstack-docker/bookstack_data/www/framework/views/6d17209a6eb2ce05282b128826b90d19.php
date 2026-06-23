<div id="actions" class="actions mb-xl">
    <h5><?php echo e(trans('common.actions')); ?></h5>
    <div class="icon-list text-link">
        <?php if(userCan(\BookStack\Permissions\Permission::BookCreateAll)): ?>
            <a href="<?php echo e(url("/create-book")); ?>" data-shortcut="new" class="icon-list-item">
                <span><?php echo (new \BookStack\Util\SvgIcon('add'))->toHtml(); ?></span>
                <span><?php echo e(trans('entities.books_create')); ?></span>
            </a>
        <?php endif; ?>

        <?php echo $__themeViews->handleViewInclude('entities.view-toggle', ['view' => $view, 'type' => 'books'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>

        <a href="<?php echo e(url('/tags')); ?>" class="icon-list-item">
            <span><?php echo (new \BookStack\Util\SvgIcon('tag'))->toHtml(); ?></span>
            <span><?php echo e(trans('entities.tags_view_tags')); ?></span>
        </a>

        <?php if(userCan(\BookStack\Permissions\Permission::ContentImport)): ?>
            <a href="<?php echo e(url('/import')); ?>" class="icon-list-item">
                <span><?php echo (new \BookStack\Util\SvgIcon('upload'))->toHtml(); ?></span>
                <span><?php echo e(trans('entities.import')); ?></span>
            </a>
        <?php endif; ?>
    </div>
</div><?php /**PATH /app/www/resources/views/books/parts/index-sidebar-section-actions.blade.php ENDPATH**/ ?>