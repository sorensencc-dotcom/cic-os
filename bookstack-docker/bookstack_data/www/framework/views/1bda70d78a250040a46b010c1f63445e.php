
<label class="checkbox">
    <input type="checkbox"
           name="filters[<?php echo e($name); ?>]"
           <?php if(isset($filters[$name]) && (!$value || ($value && $value === $filters[$name]))): ?> checked="checked" <?php endif; ?>
           value="<?php echo e($value ?: 'true'); ?>">
    <?php echo e($slot); ?>

</label><?php /**PATH /app/www/resources/views/search/parts/boolean-filter.blade.php ENDPATH**/ ?>