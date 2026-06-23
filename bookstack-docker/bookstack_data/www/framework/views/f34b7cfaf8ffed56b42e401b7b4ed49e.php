
<label class="inline checkbox text-<?php echo e($entity); ?>">
    <input type="checkbox" name="types[]"
           <?php if($checked): ?> checked <?php endif; ?>
           value="<?php echo e($entity); ?>"><?php echo e(trans('entities.' . $transKey)); ?>

</label><?php /**PATH /app/www/resources/views/search/parts/type-filter.blade.php ENDPATH**/ ?>