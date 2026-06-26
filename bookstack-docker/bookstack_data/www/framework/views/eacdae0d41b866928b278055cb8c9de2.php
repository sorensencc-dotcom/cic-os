<?php $__env->startSection('body'); ?>
    <?php echo $__themeViews->handleViewInclude('shelves.parts.list', ['shelves' => $shelves, 'view' => $view, 'listOptions' => $listOptions], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('right'); ?>
    <?php echo $__themeViews->handleViewInclude('shelves.parts.index-sidebar-section-actions', ['view' => $view], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('left'); ?>
    <?php echo $__themeViews->handleViewInclude('shelves.parts.index-sidebar-section-recents', ['recents' => $recents], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
    <?php echo $__themeViews->handleViewInclude('shelves.parts.index-sidebar-section-popular', ['popular' => $popular], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
    <?php echo $__themeViews->handleViewInclude('shelves.parts.index-sidebar-section-new', ['new' => $new], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.tri', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /app/www/resources/views/shelves/index.blade.php ENDPATH**/ ?>